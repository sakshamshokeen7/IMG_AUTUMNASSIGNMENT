from rest_framework import serializers
from accounts.models import User
from events.models import Event


class AssignRoleSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role_name = serializers.CharField()

    def validate(self, attrs):
        try:
            user = User.objects.get(id=attrs['user_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")

        # ensure role_name is one of defined choices
        valid_roles = [c[0] for c in User.Role.choices]
        if attrs['role_name'] not in valid_roles:
            raise serializers.ValidationError({"role_name": "Invalid role name."})

        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        role_name = self.validated_data['role_name']

        # if assigning ADMIN, promote to superuser/staff
        if role_name == 'ADMIN':
            user.is_superuser = True
            user.is_staff = True
        else:
            # demote superuser if not ADMIN
            user.is_superuser = False
            # keep is_staff true only for admins; otherwise false
            user.is_staff = False

        user.role = role_name
        user.save()
        return user


class CreateEventSerializer(serializers.ModelSerializer):
    # accept optional coordinators list of user pks (write-only)
    coordinators = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    # accept a cover image upload; serializer will create a Photo and attach it
    cover_upload = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Event
        fields = [
            'name', 'slug', 'description', 'start_datetime', 'end_datetime', 'location',
            'is_public', 'qr_code_url', 'coordinators', 'cover_upload'
        ]

    def validate(self, attrs):
        # auto-generate slug from name if not provided
        if not attrs.get('slug') and attrs.get('name'):
            from django.utils.text import slugify
            base = slugify(attrs['name'])[:50] or 'event'
            slug = base
            # ensure unique
            i = 1
            while Event.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            attrs['slug'] = slug
        return attrs

    def create(self, validated_data, **kwargs):
        coords = validated_data.pop('coordinators', [])
        cover = validated_data.pop('cover_upload', None)

        # ``created_by`` passed from view via serializer.save(created_by=...)
        created_by = kwargs.get('created_by')

        # create event (exclude any fields not matching model)
        event = Event.objects.create(**validated_data)

        # attach coordinators if any
        if coords:
            try:
                users = User.objects.filter(id__in=coords)
                event.coordinators.set(users)
            except Exception:
                pass

        # if a cover image was uploaded, create a Photo and set as cover
        if cover is not None:
            from photos.models import Photo
            try:
                photo = Photo.objects.create(
                    event=event,
                    uploader=created_by if created_by is not None else None,
                    original_file=cover,
                    display_file=cover,
                    thumbnail_file=cover,
                )
                event.cover_photo = photo
                event.save()
            except Exception:
                # ignore photo creation failure; event remains without cover
                pass

        return event

