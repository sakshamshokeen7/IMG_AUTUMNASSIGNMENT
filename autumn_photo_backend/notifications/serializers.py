from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_name=serializers.CharField(source='actor.username', read_only=True)

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