from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_name=serializers.SerializerMethodField()

    class Meta:
        model=Notification
        fields=[
            'id',
            'reciepient',
            'actor',
            'actor_name',
            'notification_types',
            'message',
            'is_read',
            'created_at',
            'photo_id',
            'event_id',
        ]
        def get_actor_name(self, obj):
            user = obj.actor
            return user.full_name or user.email.split("@")[0]