from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment
from .serializers import (
    PhotoSerializer,
    PhotoLikeSerializer,
    PhotoFavouriteSerializer,
    PersonTagSerializer,
    PhotoCommentSerializer,
)



class PhotoUploadAPIView(generics.CreateAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)



class EventPhotoListAPIView(generics.ListAPIView):
    serializer_class = PhotoSerializer

    def get_queryset(self):
        event_id = self.kwargs["event_id"]
        return Photo.objects.filter(event_id=event_id, is_deleted=False)



class PhotoDetailAPIView(generics.RetrieveAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer



class ToggleLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        photo = Photo.objects.get(id=photo_id)
        like, created = photo_like.objects.get_or_create(photo=photo, user=request.user)

        if not created:
            like.delete()
            return Response({"message": "Unliked"})

        return Response({"message": "Liked"})



class ToggleFavouriteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        photo = Photo.objects.get(id=photo_id)
        fav, created = photo_favourite.objects.get_or_create(photo=photo, user=request.user)

        if not created:
            fav.delete()
            return Response({"message": "Removed from favourites"})

        return Response({"message": "Added to favourites"})



class TagPersonAPIView(generics.CreateAPIView):
    serializer_class = PersonTagSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)



class CommentCreateAPIView(generics.CreateAPIView):
    serializer_class = PhotoCommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CommentListAPIView(generics.ListAPIView):
    serializer_class = PhotoCommentSerializer

    def get_queryset(self):
        return PhotoComment.objects.filter(photo_id=self.kwargs["photo_id"])
