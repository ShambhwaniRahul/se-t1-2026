from rest_framework.permissions import BasePermission
from humanresources.models import EmployeeRole

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
        enum_roles = [
            EmployeeRole.RoleChoices(role_value) 
            for role_value in request.user.employeerole_set.values_list('role', flat=True)
        ]
        for role in enum_roles:
            print(role, required_roles)
            if role in required_roles:
                return True
        return False
