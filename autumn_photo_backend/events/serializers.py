from rest_framework import serializers
from .models import Event
from accounts.models import User

class EventSerializer(serializers.ModelSerializer):
    coordinators = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all()
    )

    # what frontend should use
    cover = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'start_datetime',
            'end_datetime',
            'location',
            'qr_code_url',
            'is_public',
            'created_at',

            # keep FK for create/update
            'cover_photo',

            # actual image URL
            'cover',

            'created_by',
            'coordinators',
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

    def get_cover(self, obj):
        photo = obj.cover_photo
        if not photo:
            return None

        # IMPORTANT: check file existence safely
        if getattr(photo, 'thumbnail_file', None) and photo.thumbnail_file:
            return photo.thumbnail_file.url

        if getattr(photo, 'display_file', None) and photo.display_file:
            return photo.display_file.url

        if getattr(photo, 'original_file', None) and photo.original_file:
            return photo.original_file.url

        return None
