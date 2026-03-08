from rest_framework.permissions import BasePermission

class RequiresRole(BasePermission):
    """
    Evaluates endpoint access against the authenticated user's assigned role integer.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        required_roles = getattr(view, 'required_roles', [])
        
        if not required_roles:
            return True
            
        return request.user.role in required_roles
