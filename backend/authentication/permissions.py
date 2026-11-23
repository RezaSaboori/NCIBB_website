from rest_framework import permissions

from apps.user_management.access import IsPlatformAdmin, is_admin


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        return obj.owner == request.user


class IsAdminOrManagerOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin or manager users.
    """
    def has_permission(self, request, view):
        return is_admin(request.user)


CanManageUsers = IsPlatformAdmin


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow users to access their own data or admin users to access any data.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can access any object
        if is_admin(request.user):
            return True
        
        # Users can only access their own objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'sender'):
            return obj.sender == request.user
        elif hasattr(obj, 'recipient'):
            return obj.recipient == request.user
        
        return False


class IsAdminOrSelf(permissions.BasePermission):
    """
    Custom permission to allow users to access their own profile or admin users to access any profile.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can access any profile
        if is_admin(request.user):
            return True
        
        # Users can only access their own profile
        return obj == request.user
