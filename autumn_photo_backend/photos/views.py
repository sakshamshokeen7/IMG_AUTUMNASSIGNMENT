from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment
from events.models import Event
from notifications.tasks import send_notification as create_notification

from .serializers import (
    PhotoSerializer,
    PhotoDetailSerializer,
    PhotoCommentSerializer,
    AddCommentSerializer,
    EventPhotoSerializer,
    PersonTagSerializer,
    MultiplePhotoUploadSerializer,
)

from .utils import generate_thumbnail, generate_display, extract_exif


# =========================
# PHOTO UPLOAD
# =========================
class PhotoUploadAPIView(generics.CreateAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)


# =========================
# EVENT PHOTOS
# =========================
class EventPhotoListAPIView(APIView):
    def get(self, request, event_id):
        sort = request.GET.get("sort", "latest")

        photos = (
            Photo.objects.filter(event_id=event_id, is_deleted=False)
            .annotate(
                likes_count=Count("likes"),
                comments_count=Count("comments"),
                favourites_count=Count("favourites"),
            )
        )

        if sort == "likes":
            photos = photos.order_by("-likes_count")
        else:
            photos = photos.order_by("-created_at")

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )

        return Response({
            "event": event_id,
            "total_photos": photos.count(),
            "photos": serializer.data
        })


# =========================
# PHOTO DETAIL
# =========================
class PhotoDetailAPIView(APIView):
    def get(self, request, photo_id):
        photo = (
            Photo.objects.filter(id=photo_id)
            .annotate(
                likes_count=Count("likes"),
                comments_count=Count("comments"),
                favourites_count=Count("favourites"),
            )
            .first()
        )

        if not photo:
            return Response({"error": "Photo not found"}, status=404)

        serializer = PhotoDetailSerializer(photo)
        return Response(serializer.data)

    def delete(self, request, photo_id):
        photo = Photo.objects.filter(id=photo_id).first()
        if not photo:
            return Response({"error": "Photo not found"}, status=404)

        if photo.uploader != request.user and not request.user.is_staff:
            return Response({"error": "Not authorized"}, status=403)

        photo.is_deleted = True
        photo.save()
        return Response({"message": "Photo deleted"})


# =========================
# LIKE PHOTO
# =========================
class ToggleLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        photo = Photo.objects.filter(id=photo_id).first()
        if not photo:
            return Response({"error": "Photo not found"}, status=404)

        like, created = photo_like.objects.get_or_create(
            photo=photo,
            user=request.user
        )

        if not created:
            like.delete()
            return Response({"liked": False})

        # 🔔 SEND NOTIFICATION
        if photo.uploader and photo.uploader != request.user:
            create_notification.delay({
                "recipient_id": photo.uploader.id,
                "actor_id": request.user.id,
                "notification_type": "like",
                "message": f"{request.user.email} liked your photo",
                "photo_id": photo.id
            })

        return Response({"liked": True})


# =========================
# FAVOURITE PHOTO
# =========================
class ToggleFavouriteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        photo = Photo.objects.filter(id=photo_id).first()
        if not photo:
            return Response({"error": "Photo not found"}, status=404)

        fav, created = photo_favourite.objects.get_or_create(
            photo=photo,
            user=request.user
        )

        if not created:
            fav.delete()
            return Response({"favourited": False})

        return Response({"favourited": True})


# =========================
# TAG PERSON
# =========================
class TagPersonAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        data = request.data.copy()
        tagged = data.get("tagged_user")

        from django.contrib.auth import get_user_model
        User = get_user_model()

        if not tagged:
            return Response({"error": "tagged_user is required"}, status=400)

        if str(tagged).isdigit():
            user = User.objects.filter(id=tagged).first()
        else:
            user = User.objects.filter(email__iexact=tagged).first()

        if not user:
            return Response({"error": "User not found"}, status=404)

        data["tagged_user"] = user.id

        serializer = PersonTagSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        tag = serializer.save(
            photo_id=photo_id,
            created_by=request.user
        )

        if tag.tagged_user != request.user:
            create_notification.delay({
                "recipient_id": tag.tagged_user.id,
                "actor_id": request.user.id,
                "notification_type": "tag",
                "message": f"{request.user.email} tagged you in a photo",
                "photo_id": photo_id
            })

        return Response({"message": "User tagged"})


# =========================
# COMMENTS
# =========================
class CommentCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        serializer = AddCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = PhotoComment.objects.create(
            user=request.user,
            photo_id=photo_id,
            text=serializer.validated_data["text"],
        )

        photo = comment.photo
        if photo.uploader and photo.uploader != request.user:
            create_notification.delay({
                "recipient_id": photo.uploader.id,
                "actor_id": request.user.id,
                "notification_type": "comment",
                "message": f"{request.user.email} commented on your photo",
                "photo_id": photo.id
            })

        return Response({"message": "Comment added"})


class CommentListAPIView(generics.ListAPIView):
    serializer_class = PhotoCommentSerializer

    def get_queryset(self):
        return PhotoComment.objects.filter(
            photo_id=self.kwargs["photo_id"]
        ).order_by("-created_at")


# =========================
# MULTIPLE UPLOAD
# =========================
class MultiplePhotoUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MultiplePhotoUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event_id = serializer.validated_data["event_id"]
        files = serializer.validated_data["files"]

        event = get_object_or_404(Event, id=event_id)

        from .tasks import process_photo

        uploaded = []

        for file in files:
            photo = Photo.objects.create(
                event=event,
                uploader=request.user,
                processing_status="pending",
            )
            photo.original_file.save(file.name, file)
            photo.save()

            process_photo.delay(photo.id)

            uploaded.append({
                "photo_id": photo.id,
                "status": photo.processing_status
            })

        return Response({
            "uploaded_count": len(uploaded),
            "photos": uploaded,
            "message": "Files accepted and processing in background"
        })


# =========================
# MY PHOTOS
# =========================
class MyLikedPhotosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        photos = Photo.objects.filter(
            is_deleted=False,
            likes__user=request.user
        ).distinct()

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )
        return Response({"photos": serializer.data})


class MyFavouritedPhotosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        photos = Photo.objects.filter(
            is_deleted=False,
            favourites__user=request.user
        ).distinct()

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )
        return Response({"photos": serializer.data})


class MyTaggedPhotosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        photos = Photo.objects.filter(
            is_deleted=False,
            person_tags__tagged_user=request.user
        ).distinct()

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )
        return Response({"photos": serializer.data})
