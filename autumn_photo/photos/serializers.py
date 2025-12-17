from rest_framework import serializers
from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'
        read_only_fields=['created_at','uploader','view_count']

class PhotoLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model=photo_like
        fields='__all__'

class PhotoFavouriteSerializer(serializers.ModelSerializer):
    class Meta:
        model=photo_favourite
        fields='__all_'

class PersonTagSerializer(serializers.ModelSerializer):
    class Meta:
        model=PersonTag
        fields='__all__'

class PhotoCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model=PhotoComment
        fields='__all__'
        read_only_field=['user']

class EventPhotoSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    favourites_count = serializers.IntegerField(read_only=True)
    uploader_name = serializers.CharField(source="uploader.username", read_only=True)

    class Meta:
        model = Photo
        fields = [
            "id",
            "thumbnail_file",
            "uploader_name",
            "likes_count",
            "comments_count",
            "favourites_count",
            "created_at",
            "view_count",
        ]