from rest_framework import serializers
from .models import Event
from accounts.models import User
class EventSerializer(serializers.ModelSerializer):
    coordinators=serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all()
    )
    class Meta:
        model=Event
        fields=[
            'id','name','slug','description','start_datetime',
            'end_datetime','location','qr_code_url','is_public',
            'created_at','cover_photo','created_by','coordinators'
        ]
        read_only_fields=['id','created_at','created_by']