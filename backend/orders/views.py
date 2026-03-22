from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import RequiresRole
from rest_framework.permissions import AllowAny
from .models import MenuItem
from .serializers import MenuItemSerializer
from humanresources.models import Employee

# Create your views here.
class MenuItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows MenuItem to be viewed, created, edited or deleted.
    Everyone can view menuitems.
    But, only managers can create, update or delete menuitems.
    """
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        # The get_permissions method is used to override the permission in DRF viewset.
        if self.action in ['list','retrieve']:
            # self.action has HTTP REQUEST, Endpoint and Action.
            # GET HTTP request with endpoint /get/menuitem has action = 'list'.
            # GET HTTP request with endpoint /get/menuitem/{id} has action = 'retrieve'.
            # So, if the action is 'list' or 'retrieve', we return AllowAny permission i.e, everyone can access it.  
            return [AllowAny()]
        # If the action is not 'list' or 'retrieve', we return RequiresRole permission i.e, only manager can access it.
        return [RequiresRole(required_roles=[Employee.RoleChoices.MANAGER])]