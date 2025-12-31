from rest_framework import serializers
from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = "__all__"
        read_only_fields = ["id", "created_at", "uploader", "view_count"]
        
class PhotoLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = photo_like
        fields = "__all__"


class PhotoFavouriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = photo_favourite
        fields = "__all__"

class PersonTagSerializer(serializers.ModelSerializer):
    tagged_user_name = serializers.CharField(source="tagged_user.username", read_only=True)

    class Meta:
        model = PersonTag
        fields = ["id", "tagged_user", "tagged_user_name", "face_box", "created_at"]

class PhotoCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = PhotoComment
        fields = ["id", "user_name", "text", "created_at"]


class AddCommentSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=500)

class EventPhotoSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    favourites_count = serializers.IntegerField(read_only=True)
    uploader_name = serializers.CharField(source="uploader.username", read_only=True)

    class Meta:
        model = Photo
        fields = [
            "id",
            "thumbnail_img",
            "uploader_name",
            "likes_count",
            "comments_count",
            "favourites_count",
            "created_at",
            "view_count",
        ]

class PhotoDetailSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    favourites_count = serializers.IntegerField(read_only=True)
    uploader_name = serializers.CharField(source="uploader.username", read_only=True)

    class Meta:
        model = Photo
        fields = [
            "id",
            "original_img",
            "thumbnail_img",
            "uploader_name",
            "likes_count",
            "comments_count",
            "favourites_count",
            "view_count",
            "created_at",
            "event",
        ]

class MultiplePhotoUploadSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    files = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False
    )
