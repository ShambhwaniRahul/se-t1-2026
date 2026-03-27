from urllib import request

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import RequiresRole
from .models import PerishableSKU, PerishableInventory, NonPerishableInventory 
from .serializers import PerishableSKUSerializer, NonPerishableInventorySerializer, PerishableInventorySerializer
from humanresources.models import Employee, EmployeeRole
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import F, ExpressionWrapper, DateField, DurationField
from django.utils import timezone
from datetime import timedelta


today = timezone.now().date()

# Create your views here.

""" APIs for Perishable SKU Management:"""
class PerishableSKUListCreateAPIView(APIView):
    """
    Handles listing and creating Perishable SKUs.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
                EmployeeRole.RoleChoices.CHEF,
            ]
        else:  # POST
            self.required_roles = [
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
            ]
        return super().get_permissions()

    def get(self, request):
        min_lifespan = request.query_params.get('lifespan')
        max_lifespan = request.query_params.get('max_lifespan')
    
        queryset = PerishableSKU.objects.all()
    
        # Min filter (>=)
        if min_lifespan:
            if min_lifespan.isdigit():
                queryset = queryset.filter(
                    typical_shelf_life__gte=int(min_lifespan)
                )
            else:
                return Response(
                    {"error": "lifespan must be an integer"},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
        # Max filter (<=)
        if max_lifespan:
            if max_lifespan.isdigit():
                queryset = queryset.filter(
                    typical_shelf_life__lte=int(max_lifespan)
                )
            else:
                return Response(
                    {"error": "max_lifespan must be an integer"},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
        serializer = PerishableSKUSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        serializer = PerishableSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PerishableSKUDetailAPIView(APIView):
    """
    Handles retrieve, update, and delete for a single Perishable SKU.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
                EmployeeRole.RoleChoices.CHEF,
            ]
        else:  # PATCH, DELETE
            self.required_roles = [
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
            ]
        return super().get_permissions()

    def get(self, request, pk):
        perishable_sku = get_object_or_404(PerishableSKU, pk=pk)
        serializer = PerishableSKUSerializer(perishable_sku)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        perishable_sku = get_object_or_404(PerishableSKU, pk=pk)
        serializer = PerishableSKUSerializer(perishable_sku, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        perishable_sku = get_object_or_404(PerishableSKU, pk=pk)
        perishable_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

 

""" APIs for Perishable Inventory Management:"""
class PerishableInventoryListAPIView(APIView):
    """
    Handles the list operations for Perishable Inventory batches.
    Supports filtering by SKU and expiration status.
    The type of requests for perishable-inventory/ endpoint are:-
    1. GET : /perishable-inventory/ : Will return a list of all perishable inventory items.
    3. GET : /perishable-inventory/?sku=<int:sku_id>/ : Will return a list of perishable inventory items filtered by the specified SKU ID.
    4. GET : /perishable-inventory/?expiry=true/ : Will return a list of expired perishable inventory items.
    5. GET : /perishable-inventory/?sku=<int:sku_id>&expired=false : Will return a list of non-expired perishable inventory items filtered by the specified SKU ID.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER,
        EmployeeRole.RoleChoices.CHEF,
    ]



    def get(self, request):
        sku = request.query_params.get('sku')
        expiry = request.query_params.get('expired')
    
        today = timezone.now().date()
    
        queryset = PerishableInventory.objects.select_related('sku').annotate(
            expiry_date=ExpressionWrapper(
                F('purchase_date') + ExpressionWrapper(
                    F('sku__typical_shelf_life') * timedelta(days=1),
                    output_field=DurationField()
                ),
                output_field=DateField()
            )
        ).order_by('-created_at')
    
        # ✅ Filter by SKU
        if sku and sku.isdigit():
            queryset = queryset.filter(sku_id=int(sku))
    
        # ✅ Filter by expiration status
        if expiry == 'true':
            queryset = queryset.filter(expiry_date__lt=today)
        elif expiry == 'false':
            queryset = queryset.filter(expiry_date__gte=today)
    
        serializer = PerishableInventorySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



### APIs for the Perishable Inventory:
class PerishableInventoryDetailAPIView(APIView):
    """
    Handles retrieve, update, and delete for a single Perishable Inventory batch.
    """

    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
           self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
                EmployeeRole.RoleChoices.CHEF,
           ]

        else:  # PATCH, DELETE
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
            ]

        return super().get_permissions()    


    def get(self, request, pk):
            perishable_inventory = get_object_or_404(PerishableInventory, pk=pk)
            serializer = PerishableInventorySerializer(perishable_inventory)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
    def patch(self, request, pk):
            perishable_inventory = get_object_or_404(PerishableInventory, pk=pk)
            serializer = PerishableInventorySerializer(perishable_inventory, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
            perishable_inventory = get_object_or_404(PerishableInventory, pk=pk)
            if perishable_inventory.is_expired:
              perishable_inventory.delete()
              return Response(status=status.HTTP_204_NO_CONTENT)
            return Response({"details": "Cannot delete an non-expired perishable inventory item."},status=status.HTTP_403_FORBIDDEN)


class NonPerishableInventoryListCreateAPIView(APIView):
    """
    Handles listing and creating Non-Perishable Inventory items.
    """
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER,
    ]

    def get(self, request):
        inventory_items = NonPerishableInventory.objects.all()
        serializer = NonPerishableInventorySerializer(inventory_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = NonPerishableInventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class NonPerishableInventoryDetailAPIView(APIView):
    """
    Handles retrieve, update, and delete for a single Non-Perishable Inventory item.
    """
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER,
    ]

    def get(self, request, pk):
        inventory_item = get_object_or_404(NonPerishableInventory, pk=pk)
        serializer = NonPerishableInventorySerializer(inventory_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        inventory_item = get_object_or_404(NonPerishableInventory, pk=pk)
        serializer = NonPerishableInventorySerializer(inventory_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        inventory_item = get_object_or_404(NonPerishableInventory, pk=pk)
        inventory_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)