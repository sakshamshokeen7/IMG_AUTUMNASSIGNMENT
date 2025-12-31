from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import ExifTags

def extract_exif(image):
    try:
        img = Image.open(image)
        exif_data = {}
        if hasattr(img, "_getexif"):
            raw_exif = img._getexif() or {}
            for tag, value in raw_exif.items():
                key = ExifTags.TAGS.get(tag, tag)
                exif_data[key] = str(value)
        return exif_data
    except:
        return {}
    
def generate_thumbnail(image):
    img = Image.open(image)
    img.thumbnail((400, 400))

    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    return ContentFile(buffer.getvalue())

def generate_display(image):
    img = Image.open(image)
    img.thumbnail((1200, 1200))

    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    return ContentFile(buffer.getvalue())

def generate_watermarked_display(image, text="IMG"):
    img = Image.open(image).convert("RGBA")

    watermark_layer = Image.new("RGBA", img.size)
    draw = ImageDraw.Draw(watermark_layer)

    font = ImageFont.load_default()
    text_width, text_height = draw.textsize(text, font)

    x = img.size[0] - text_width - 40
    y = img.size[1] - text_height - 40

    draw.text((x, y), text, font=font, fill=(255, 255, 255, 150))

    merged = Image.alpha_composite(img, watermark_layer)

    buffer = BytesIO()
    merged.convert("RGB").save(buffer, format="JPEG")
    return ContentFile(buffer.getvalue())
