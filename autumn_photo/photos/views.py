from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment
from events.models import Event
from notifications.tasks import create_notification

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

class PhotoUploadAPIView(generics.CreateAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)

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

        serializer = EventPhotoSerializer(photos, many=True)
        return Response(serializer.data)

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

        if photo.uploader and photo.uploader != request.user:
            create_notification.delay({
                "recipient": photo.uploader,
                "actor": request.user,
                "notification_type": "like",
                "message": f"{request.user.email} liked your photo",
                "photo": photo
            })

        return Response({"liked": True})

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

class TagPersonAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        serializer = PersonTagSerializer(data=request.data)

        if serializer.is_valid():
            tag = serializer.save(
                photo_id=photo_id,
                created_by=request.user
            )

            if tag.tagged_user != request.user:
                create_notification.delay({
                    "recipient": tag.tagged_user,
                    "actor": request.user,
                    "notification_type": "tag",
                    "message": f"{request.user.email} tagged you in a photo",
                    "photo_id": photo_id
                })

            return Response({"message": "User tagged"})

        return Response(serializer.errors, status=400)

class CommentCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        serializer = AddCommentSerializer(data=request.data)

        if serializer.is_valid():
            comment = PhotoComment.objects.create(
                user=request.user,
                photo_id=photo_id,
                text=serializer.validated_data["text"],
            )

            photo = comment.photo
            if photo.uploader and photo.uploader != request.user:
                create_notification.delay({
                    "recipient": photo.uploader,
                    "actor": request.user,
                    "notification_type": "comment",
                    "message": f"{request.user.email} commented on your photo",
                    "photo": photo
                })

            return Response({"message": "Comment added"})

        return Response(serializer.errors, status=400)

class CommentListAPIView(generics.ListAPIView):
    serializer_class = PhotoCommentSerializer

    def get_queryset(self):
        return PhotoComment.objects.filter(
            photo_id=self.kwargs["photo_id"]
        ).order_by("-created_at")

class MultiplePhotoUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MultiplePhotoUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        event_id = serializer.validated_data["event_id"]
        files = serializer.validated_data["files"]

        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Invalid event_id"}, status=404)

        uploaded = []

        for file in files:
            thumb = generate_thumbnail(file)
            display = generate_display(file)

            photo = Photo.objects.create(
                event=event,
                uploader=request.user,
                exif_metadata=extract_exif(file),
            )

            photo.original_file.save(file.name, file)
            photo.thumbnail_file.save(f"thumb_{file.name}", thumb)
            photo.display_file.save(f"display_{file.name}", display)

            uploaded.append({
                "photo_id": photo.id,
                "thumbnail": photo.thumbnail_file.url
            })

        return Response({
            "uploaded_count": len(uploaded),
            "photos": uploaded
        })
