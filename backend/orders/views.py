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