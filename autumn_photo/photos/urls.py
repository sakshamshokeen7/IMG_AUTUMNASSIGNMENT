from django.urls import path
from .views import (
    PhotoUploadAPIView,
    EventPhotoListAPIView,
    PhotoDetailAPIView,
    ToggleLikeAPIView,
    ToggleFavouriteAPIView,
    TagPersonAPIView,
    CommentCreateAPIView,
    CommentListAPIView,
)

urlpatterns = [
    path("upload/", PhotoUploadAPIView.as_view()),
    path("event/<int:event_id>/", EventPhotoListAPIView.as_view()),
    path("<int:pk>/", PhotoDetailAPIView.as_view()),

    path("<int:photo_id>/like/", ToggleLikeAPIView.as_view()),
    path("<int:photo_id>/favourite/", ToggleFavouriteAPIView.as_view()),

    path("tag/", TagPersonAPIView.as_view()),

    path("<int:photo_id>/comments/", CommentListAPIView.as_view()),
    path("<int:photo_id>/comments/add/", CommentCreateAPIView.as_view()),
]
