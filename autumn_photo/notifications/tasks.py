from celery import shared_task
from .models import Notification


@shared_task
def create_notification(data):
    Notification.objects.create(**data)
