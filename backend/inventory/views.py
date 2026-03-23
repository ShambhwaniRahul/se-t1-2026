from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import RequiresRole
from .models import PerishableSKU 
from .serializers import PerishableSKUSerializer
from humanresources.models import Employee, EmployeeRole
from django.shortcuts import get_object_or_404

# Create your views here.
class PerishableSKUListCreateAPIView(APIView):
    """
    Handles CRUD operations for Perishable SKUs.
    Implements dynamic role-based access control per HTTP method.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        """
        Intercepts the permission initialization phase to dynamically assign 
        required roles based on the request method.
        """
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
                EmployeeRole.RoleChoices.CHEF,
            ]
        else:
            self.required_roles = [
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
            ]
        
        return super().get_permissions()

    def get(self, request, pk=None):
        if pk is None:
            skus = PerishableSKU.objects.all()
            serializer = PerishableSKUSerializer(skus, many=True)
        else:
            perishable_sku = get_object_or_404(PerishableSKU, pk=pk)
            serializer = PerishableSKUSerializer(perishable_sku)
        
        return Response(serializer.data)

    def post(self, request):
        serializer = PerishableSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        perishable_sku = get_object_or_404(PerishableSKU, pk=pk)
        serializer = PerishableSKUSerializer(perishable_sku, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        perishable_sku = get_object_or_404(PerishableSKU, pk=pk)
        perishable_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

