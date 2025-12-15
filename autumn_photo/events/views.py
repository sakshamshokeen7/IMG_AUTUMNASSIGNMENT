from rest_framework import permissions,generics
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
    


    