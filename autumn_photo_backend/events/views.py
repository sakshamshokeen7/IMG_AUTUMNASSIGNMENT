from requests import Response
from rest_framework import permissions,generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from photos.models import Photo
from photos.serializers import EventPhotoSerializer
from .models import Event
from django.db import models
from .serializers import EventSerializer
from .permissions import ISADMIN_OR_COORDINATOR

# Create your views here.
class EventListApiView(generics.ListCreateAPIView):
    
    serializer_class=EventSerializer
    def get_queryset(self):
        user=self.request.user
        if user.is_authenticated and user.role=='ADMIN':
            return Event.objects.all()
        if user.is_authenticated:
            return Event.objects.filter(
                models.Q(is_public=True) |
                models.Q(coordinators=user)
            )
        return Event.objects.filter(is_public=True)
    
class EventCreateApiView(generics.CreateAPIView):
    query_set=Event.objects.all()
    serializer_class=EventSerializer
    permission_classes=[permissions.IsAuthenticated]

    def perform_create(self,serializer):
        if self.request.user.role!='ADMIN':
            raise PermissionError("Only ADMIN users can create events.")
        serializer.save(created_by=self.request.user)

class EventDetailApiView(generics.RetrieveUpdateDestroyAPIView):
    query_set=Event.objects.all()
    serializer_class=EventSerializer
    permission_classes=[permissions.IsAuthenticated,ISADMIN_OR_COORDINATOR] 
    
class EventPhotoGalleryAPIView(APIView):
    permission_classes = [ISADMIN_OR_COORDINATOR]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=404)

        sort = request.GET.get("sort", "latest")

        photos = Photo.objects.filter(event=event)

        photos = photos.annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
            favourites_count=Count("favourites", distinct=True),
        )

        if sort == "likes":
            photos = photos.order_by("-likes_count")
        elif sort == "views":
            photos = photos.order_by("-view_count")
        else:  
            photos = photos.order_by("-created_at")

        serializer = EventPhotoSerializer(photos, many=True)
        return Response({
            "event": event.name,
            "total_photos": photos.count(),
            "photos": serializer.data
        })

    