from rest_framework import permissions

class ISADMIN_OR_COORDINATOR(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # allow Django superusers regardless of role field
        if getattr(user, 'is_superuser', False):
            return True

        # role may be stored in different case - compare case-insensitive
        role = getattr(user, 'role', '') or ''
        if str(role).upper() == 'ADMIN':
            return True

        # allow coordinators
        try:
            return obj.coordinators.filter(id=user.id).exists()
        except Exception:
            return False