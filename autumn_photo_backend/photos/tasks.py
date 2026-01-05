from celery import shared_task
from django.core.files.base import ContentFile
from .models import Photo
from .utils import generate_thumbnail, generate_display, generate_watermarked_display, extract_exif
import os

@shared_task
def process_photo(photo_id):
    try:
        photo = Photo.objects.get(id=photo_id)
    except Photo.DoesNotExist:
        return {'status': 'missing'}

    photo.processing_status = 'processing'
    photo.save()

    try:
        # open original file (Django storage)
        orig = photo.original_file
        # generate thumbnail
        thumb = generate_thumbnail(orig)
        display = generate_display(orig)
        watermarked = generate_watermarked_display(orig)

        # save files (use basename to avoid nested paths)
        base_name = os.path.basename(orig.name)
        photo.thumbnail_file.save(f"thumb_{base_name}", thumb, save=False)
        photo.display_file.save(f"display_{base_name}", display, save=False)

        # optionally save a watermarked display as display_file
        # if you prefer watermark on display, replace display_file
        # photo.display_file.save(f"display_{orig.name}", watermarked, save=False)

        # extract exif
        exif = extract_exif(orig)
        photo.exif_metadata = exif or {}

        photo.processing_status = 'done'
        photo.save()
        return {'status': 'done', 'photo_id': photo_id}
    except Exception as e:
        photo.processing_status = 'failed'
        photo.save()
        return {'status': 'error', 'error': str(e)}
