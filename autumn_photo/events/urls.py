from django.urls import path
from .views import EventListApiView,EventCreateApiView,EventDetailApiView

urlpatterns = [
    path("", EventListApiView.as_view()),
    path("create/", EventCreateApiView.as_view()),
    path("<int:pk>/", EventDetailApiView.as_view()),
]