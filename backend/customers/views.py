from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from humanresources.models import Employee
from core.permissions import RequiresRole
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    """
    Provides standard REST API endpoints for Customer entities.
    Handles GET (list/retrieve), POST (create), PUT/PATCH (update), and DELETE operations.
    """
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [RequiresRole]  # Uncomment to restrict access to authenticated users only
    required_roles = [
        Employee.RoleChoices.OWNER, 
        Employee.RoleChoices.MANAGER
    ]