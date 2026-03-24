from urllib import request

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import RequiresRole
from .models import PerishableSKU, PerishableInventory, NonPerishableInventory 
from .serializers import PerishableSKUSerializer, NonPerishableInventorySerializer # PerishableInventorySerializer
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

    def get(self,request, pk=None):
        print("PK: ",pk)
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
    

class NonPerishableInventoryViewSet(APIView):
    """Handles CRUD operations for Non-Perishable Inventory items."""
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
            inventory = NonPerishableInventory.objects.all()
            serializer = NonPerishableInventorySerializer(inventory, many=True)
        else:
            inventory_item = get_object_or_404(NonPerishableInventory, pk=pk)
            serializer = NonPerishableInventorySerializer(inventory_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = NonPerishableInventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        inventory_item = get_object_or_404(NonPerishableInventory, pk=pk)
        serializer = NonPerishableInventorySerializer(inventory_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        inventory_item = get_object_or_404(NonPerishableInventory, pk=pk)
        inventory_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# class PerishableInventoryListCreateAPIView(APIView):
#     """
#     Handles CRUD operations for Perishable Inventory batches.
#     Implements dynamic role-based access control per HTTP method.
#     """
#     permission_classes = [RequiresRole]
#     required_roles = [
#         EmployeeRole.RoleChoices.OWNER,
#         EmployeeRole.RoleChoices.MANAGER,
#         EmployeeRole.RoleChoices.INVENTORY_MANAGER,
#     ]

#     def get(self, request, pk=None):
#         sku = request.query_params.get('sku')
    
#         if pk is None:
#             queryset = PerishableInventory.objects.select_related('sku')
    
#             if sku:
#                 queryset = queryset.filter(sku_id=sku)
    
#             serializer = PerishableInventorySerializer(queryset, many=True)
    
#         else:
#             inventory = get_object_or_404(
#                 PerishableInventory.objects.select_related('sku'),
#                 pk=pk
#             )
#             serializer = PerishableInventorySerializer(inventory)
    
#         return Response(serializer.data, status=status.HTTP_200_OK)


#     def post(self, request):
#         serializer = PerishableInventorySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def patch(self, request, pk):
#         inventory = get_object_or_404(PerishableInventory, pk=pk)
#         serializer = PerishableInventorySerializer(inventory, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def delete(self, request, pk):
#         inventory = get_object_or_404(PerishableInventory, pk=pk)
    
#         inventory.delete()
    
#         return Response(
#             {"message": "Inventory deleted successfully"},
#             status=status.HTTP_204_NO_CONTENT
#         )