from rest_framework.views import APIView
from rest_framework import status
from core.permissions import RequiresRole
from .models import PerishableSKU, PerishableInventory, NonPerishableInventory 
from .serializers import PerishableSKUSerializer, NonPerishableInventorySerializer, PerishableInventorySerializer
from humanresources.models import EmployeeRole
from django.utils import timezone
from django.db.models import F, ExpressionWrapper, DateField, DurationField
from django.utils import timezone
from datetime import timedelta
from utils.response import standard_response


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
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.INVENTORY_MANAGER,
                EmployeeRole.RoleChoices.CHEF,
            ]
        else:  # POST
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
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
                return standard_response(
                    success=False,
                    message="min_lifespan must be an integer",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
    
        # Max filter (<=)
        if max_lifespan:
            if max_lifespan.isdigit():
                queryset = queryset.filter(
                    typical_shelf_life__lte=int(max_lifespan)
                )
            else:
                return standard_response(
                    success=False,
                    message="max_lifespan must be an integer",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
    
        serializer = PerishableSKUSerializer(queryset, many=True)
        return standard_response(
            success=True,
            message="Perishable SKUs with given query parameters retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
            )


    def post(self, request):
        serializer = PerishableSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Perishable SKU Created Successfully!",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        return standard_response(
            success=False,
            message="Failed to create Perishable SKU.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


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
    
    def get_object(self,pk):
        try:
            return PerishableSKU.objects.get(pk=pk)
        except PerishableSKU.DoesNotExist:
            return None
        
    def standard_error_response(self, message="Perishable SKU not found.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )    


    def get(self, request, pk):
        perishable_sku = self.get_object(pk)
        if perishable_sku is None:
            return self.standard_error_response()
        serializer = PerishableSKUSerializer(perishable_sku)
        return standard_response(
            success=True,
            message="Perishable SKU retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def patch(self, request, pk):
        perishable_sku = self.get_object(pk)
        if perishable_sku is None:
            return self.standard_error_response()
        serializer = PerishableSKUSerializer(perishable_sku, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Perishable SKU updated successfully.",
                data=serializer.data,
                 status_code=status.HTTP_200_OK)
        return standard_response(
            success=False,
            message="Failed to update Perishable SKU.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        perishable_sku = self.get_object(pk)
        if perishable_sku is None:
            return self.standard_error_response()
        perishable_sku.delete()
        return standard_response(
            success=True, 
            message="Perishable SKU deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT)

 

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
        if not queryset.exists():
            return standard_response(
                success=False,
                message="No perishable inventory found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return standard_response(
            success=True,
            message="Perishable Inventory list retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
            )  



### APIs for the Perishable Inventory:
class PerishableInventoryDetailAPIView(APIView):
    """
    Handles retrieve and delete for a single Perishable Inventory batch.
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
    

    def get_object(self,pk):
        try:
            return PerishableInventory.objects.get(pk=pk)
        except PerishableInventory.DoesNotExist:
            return None
        
    def standard_error_response(self, message="Perishable Inventory not found.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )


    def get(self, request, pk):
            perishable_inventory = self.get_object(pk)
            if perishable_inventory is None:
                return self.standard_error_response()
            serializer = PerishableInventorySerializer(perishable_inventory)
            return standard_response(
                success=True,
                message="Perishable Inventory retrieved successfully.", 
                data=serializer.data,
                status_code=status.HTTP_200_OK) 
        
    def delete(self, request, pk):
            perishable_inventory = self.get_object(pk)
            if perishable_inventory is None:
                return self.standard_error_response()
            if perishable_inventory.is_expired:
              perishable_inventory.delete()
              return standard_response(
                  success=True,
                  message="Perishable Inventory deleted successfully.",
                  status_code=status.HTTP_204_NO_CONTENT)
            return standard_response(
                success=False,
                message="Cannot delete an non-expired perishable inventory item.",
                status_code=status.HTTP_403_FORBIDDEN)


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
        return standard_response(
            success=True, 
            message="Non-Perishable Inventory list retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK)
    

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

    def get_object(self,pk):
        try:
            return NonPerishableInventory.objects.get(pk=pk)
        except NonPerishableInventory.DoesNotExist:
            return None
        
    def standard_error_response(self, message="Non-Perishable Inventory not found.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )

    def get(self, request, pk):
        inventory_item = self.get_object(pk)
        if inventory_item is None:
            return self.standard_error_response()
        serializer = NonPerishableInventorySerializer(inventory_item)
        return standard_response(
            success=True,
            message="Non-Perishable Inventory retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        inventory_item = self.get_object(pk)
        if inventory_item is None:
            return self.standard_error_response()
        inventory_item.delete()
        return standard_response(
            success=True,
            message="Non-Perishable Inventory deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT)