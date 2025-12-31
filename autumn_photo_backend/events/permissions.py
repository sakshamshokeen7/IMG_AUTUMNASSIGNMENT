from rest_framework import permissions

class ISADMIN_OR_COORDINATOR(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user=request.user
        if not user.is_authenticated:
            return False
        if user.role=='ADMIN':
            return True
        if user in obj.coordinators.all():
            return True
        return False