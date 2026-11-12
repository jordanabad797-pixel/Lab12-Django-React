from rest_framework import permissions

class QuizPermission(permissions.BasePermission):
    """
    Custom permission rule:
    - Humans (profe / staff / superuser): full access (read, create, update, delete).
    - Agent group ('agente'): read, create, modify, but NEVER delete (returns 403).
    - Others / Unauthenticated: read-only (GET, HEAD, OPTIONS) if allowed or authenticated.
    """

    def has_permission(self, request, view):
        # Allow safe methods for everyone (or authenticated)
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser or staff or user in 'profe' group has full access
        if request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name='profe').exists():
            return True

        # User in 'agente' group can create and modify, but NEVER delete
        if request.user.groups.filter(name='agente').exists():
            if request.method == 'DELETE':
                return False  # Explicitly deny delete -> triggers 403
            return True

        # Default deny for non-authorized users on non-safe methods
        return False
