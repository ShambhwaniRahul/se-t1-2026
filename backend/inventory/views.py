# views.py
from rest_framework.views import APIView
from rest_framework import status
from core.permissions import RequiresRole
from .models import PerishableSKU, PerishableInventory, NonPerishableInventory 
from .serializers import PerishableSKUSerializer, NonPerishableInventorySerializer, PerishableInventorySerializer
from humanresources.models import EmployeeRole
from django.utils import timezone
from django.db.models import F, ExpressionWrapper, DateField, DurationField
from datetime import timedelta
from utils.response import standard_response, paginated_response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


today = timezone.now().date()

""" APIs for Perishable SKU Management:"""
class PerishableSKUListCreateAPIView(APIView):
    """
    Handles listing and creating Perishable SKUs.
    The Owner, manager, inventory manager, and chef can view it, but the chef can't create.  
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

    @extend_schema(
        responses=PerishableSKUSerializer,
        parameters=[
            OpenApiParameter(
                name="lifespan",
                type=OpenApiTypes.INT,
                description="Minimum lifespan of the perishable SKU in days. Must be a positive integer.",
                required=False
            ),
            OpenApiParameter(
                name="max_lifespan",
                type=OpenApiTypes.INT,
                description="Maximum lifespan of the perishable SKU in days. Must be a positive integer.",
                required=False),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                description="Search term to filter SKUs by name.",
                required=False)
        ])
    def get(self, request):
        min_lifespan = request.query_params.get('lifespan')
        max_lifespan = request.query_params.get('max_lifespan')
        search_term = request.query_params.get('search', '')
    
        queryset = PerishableSKU.objects.all()
    
        # Apply global text search filter
        if search_term:
            queryset = queryset.filter(name__icontains=search_term)
    
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
    
        return paginated_response(
            queryset=queryset,
            request=request,
            serializer_class=PerishableSKUSerializer,
            message="Perishable SKUs retrieved successfully."
        )

    @extend_schema(
        request=PerishableSKUSerializer,
        responses=PerishableSKUSerializer
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
    The Owner, manager, inventory manager, and chef can view it, but the chef can't edit or delete.  
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

    @extend_schema(
        responses=PerishableSKUSerializer
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

    extend_schema(
        request=PerishableSKUSerializer,
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
            status_code=status.HTTP_200_OK)

 
""" APIs for Perishable Inventory Management:"""
class PerishableInventoryListAPIView(APIView):
    """
    Handles the list operations for Perishable Inventory batches.
    Supports filtering by SKU, expiration status, and search term.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER,
        EmployeeRole.RoleChoices.CHEF,
    ]

    @extend_schema(
        responses=PerishableInventorySerializer,
        parameters=[
            OpenApiParameter(
                name="sku",
                type=OpenApiTypes.INT,
                description="The ID of the perishable SKU to filter by.",
                required=False
            ),
            OpenApiParameter(
                name="expired",
                type=OpenApiTypes.BOOL,
                description="Whether to filter by expired perishable inventory items (true) or non-expired perishable inventory items (false).",
                required=False
            ),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                description="Search term to filter inventory items by related SKU name.",
                required=False
            )
        ]
    )
    def get(self, request):
        sku = request.query_params.get('sku')
        expiry = request.query_params.get('expired')
        search_term = request.query_params.get('search', '')
    
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

        # Apply global text search filter via related SKU relation
        if search_term:
            queryset = queryset.filter(sku__name__icontains=search_term)
    
        # Filter by SKU
        if sku and sku.isdigit():
            queryset = queryset.filter(sku_id=int(sku))
    
        # Filter by expiration status
        if expiry == 'true':
            queryset = queryset.filter(expiry_date__lt=today)
        elif expiry == 'false':
            queryset = queryset.filter(expiry_date__gte=today)
    
        return paginated_response(
            queryset=queryset,
            request=request,
            serializer_class=PerishableInventorySerializer,
            message="Perishable Inventory list retrieved successfully."
        )  


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

    @extend_schema(
        responses=PerishableInventorySerializer
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

    def patch(self, request, pk):
        perishable_inventory = self.get_object(pk)
        
        if perishable_inventory is None:
            return self.standard_error_response()
        
        if "quantity" not in request.data:
            return standard_response(
                success=False,
                message="Only quantity field can be updated for Perishable Inventory.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        quantity = request.data.get("quantity")
    
        try:
            quantity = float(quantity)
        except:
            return standard_response(
                success=False,
                message="Quantity must be a number.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        if (
            quantity < 0
            or perishable_inventory.is_expired
            or quantity > perishable_inventory.quantity
        ):
            return standard_response(
                success=False,
                message="Invalid quantity. Quantity must be non-negative, cannot exceed current quantity, and cannot update expired inventory.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        perishable_inventory.quantity = quantity
        perishable_inventory.save()
    
        serializer = PerishableInventorySerializer(perishable_inventory)
    
        return standard_response(
            success=True,
            message="Perishable Inventory quantity updated successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def delete(self, request, pk):
            perishable_inventory = self.get_object(pk)
            if perishable_inventory is None:
                return self.standard_error_response()
            if perishable_inventory.is_expired:
              perishable_inventory.delete()
              return standard_response(
                  success=True,
                  message="Perishable Inventory deleted successfully.",
                  status_code=status.HTTP_200_OK)
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

    @extend_schema(
        responses=NonPerishableInventorySerializer(many=True),
        parameters=[
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                description="Search term to filter inventory items by name.",
                required=False
            )
        ]
    )
    def get(self, request):
        search_term = request.query_params.get('search', '')
        queryset = NonPerishableInventory.objects.all()
        
        # Apply global text search filter
        if search_term:
            queryset = queryset.filter(name__icontains=search_term)
            
        return paginated_response(
            queryset=queryset,
            request=request,
            serializer_class=NonPerishableInventorySerializer,
            message="Non-Perishable Inventory list retrieved successfully."
        )
    

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

    @extend_schema(
        responses=NonPerishableInventorySerializer
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
            status_code=status.HTTP_200_OK)