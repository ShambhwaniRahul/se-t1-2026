from rest_framework.views import APIView
from rest_framework import status
import json
from utils.response import standard_response
import requests
from .models import (
    Vendor, PurchaseOrder,
    OrderedNonPerishablePurchaseSKU, OrderedPerishablePurchaseSKU,
    DeliveredPerishableInventory, DeliveredNonPerishableInventory,
    VendorInvoice
    )
from .serializers import (
    VendorSerializer, PurchaseOrderSerializer,
     OrderedPerishablePurchaseSKUSerializer, OrderedNonPerishablePurchaseSKUSerializer,
     DeliveredPerishableInventorySerializer, DeliveredNonPerishableInventorySerializer,
     VendorInvoiceSerializer,PurchaseOrderDetailSerializer
)
from inventory.serializers import PerishableInventorySerializer, NonPerishableInventorySerializer
from inventory.models import PerishableSKU, NonPerishableInventory
from core.permissions import RequiresRole
from humanresources.models import EmployeeRole
from django.shortcuts import get_object_or_404
from utils.response import standard_response
from drf_spectacular.utils import extend_schema

OCR_URL = "http://localhost:5000/scan/"

# Create your views here.

""" APIs for Vendors"""
class VendorListCreateAPIView(APIView):
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    @extend_schema(responses=VendorSerializer)
    def get(self, request):
        vendors = Vendor.objects.all()
        serializer = VendorSerializer(vendors, many=True)
        return standard_response(
            success=True,
            message="Vendors retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @extend_schema(request=VendorSerializer)
    def post(self, request):
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Vendor created successfully.",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        
        return standard_response(
            success=False,
            message="Failed to create vendor.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class VendorDetailAPIView(APIView):
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get_object(self, pk):
        try:
            return Vendor.objects.get(pk=pk)
        except Vendor.DoesNotExist:
            return None 
        
    def designed_error_response(self, message):
        return standard_response(
            success=False,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )     

    def get(self, request, pk):
        vendor = self.get_object(pk)

        if vendor is not None:
            return standard_response(
                success=True,
                message="Vendor retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        serializer = VendorSerializer(vendor)
        return self.designed_error_response("No such vendor exists.")

    @extend_schema(request=VendorSerializer)
    def patch(self, request, pk):
        vendor = self.get_object(pk)
        serializer = VendorSerializer(vendor, data=request.data, partial=True)

        if vendor is None:
            return self.designed_error_response("No such vendor exists.")
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Vendor updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )

        return standard_response(
            success=False,
            message="Failed to update vendor.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        vendor = self.get_object(pk)
        if vendor is None:
            return self.designed_error_response("No such vendor exists.")
        vendor.delete()
        return standard_response(
            success=True,
            message="Vendor deleted successfully.",
            data=None,
            status_code=status.HTTP_200_OK
        )

""" APIs for Purchase Orderss"""
class PurchaseOrderListCreateAPIView(APIView):
    """
    Handles listing all purchase orders and creating a new purchase order.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]
    
    @extend_schema(responses=PurchaseOrderSerializer(many=True))
    def get(self, request):
        """
        These will be ordered by most recent purchase orders first by default.
        The endpoints here are:-
        GET /api/procurement/purchase-orders/ : List all purchase orders.
        GET /api/procurement/purchase-orders/?vendor=<vendor_id> : Filter purchase orders by vendor.
        GET /api/procurement/purchase-orders/?purchase_type=<purchase_type> : Filter purchase orders by purchase type.
        GET /api/procurement/purchase-orders/?status=<status> : Filter purchase orders by status.
        GET /api/procurement/purchase-orders/?purchase_date=<purchase_date> : Filter purchase orders by purchase date.
        Also, supports combinations of the above query parameters for more specific filtering. 
        """
        vendor = request.query_params.get('vendor')
        purchase_type = request.query_params.get('purchase_type')
        status_param = request.query_params.get('status')
        purchase_date = request.query_params.get('purchase_date')
    
        queryset = PurchaseOrder.objects.all().order_by('-created_at') # Default ordering by most recent purchase orders first.
    
        # Filter by vendor
        if vendor and vendor.isdigit():
            queryset = queryset.filter(vendor_id=int(vendor))
    
        # Filter by purchase type
        if purchase_type:
            queryset = queryset.filter(purchase_type=purchase_type)
    
        # Filter by status
        if status_param:
            queryset = queryset.filter(status=status_param)
    
        # Filter by purchase date
        if purchase_date:
            queryset = queryset.filter(purchase_date=purchase_date)
    
        serializer = PurchaseOrderSerializer(queryset, many=True)
        return standard_response(
            success=True,
            message="Purchase Orders retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @extend_schema(request=PurchaseOrderSerializer)
    def post(self, request):
        # ✅ Enforce default status = Pending
        if 'status' in request.data and request.data.get("status") != PurchaseOrder.StatusChoices.PENDING:
            return standard_response(
                success=False,
                message="New purchase orders must have status 'Pending'.",
                data=None,
                status_code=status.HTTP_400_BAD_REQUEST 
            )

        serializer = PurchaseOrderSerializer(data=request.data)
        if serializer.is_valid():
            if not request.data.get("skus") or len(request.data.get("skus")) == 0:
                return standard_response(
                    success=False, 
                    message= "At least one SKU must be included in the purchase order.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            serializer.save(status=PurchaseOrder.StatusChoices.PENDING)
            for sku in request.data.get("skus", []):
                if serializer.validated_data['purchase_type'] == PurchaseOrder.TypeChoices.PERISHABLE:
                    # sku_obj = get_object_or_404(PerishableSKU, pk=sku['sku'])
                    try:
                        sku_obj = PerishableSKU.objects.get(pk=sku['sku'])
                    except PerishableSKU.DoesNotExist:
                        return standard_response(
                            success=False,
                            message=f"No such perishable SKU exists with ID: {sku['sku']}.",
                            status_code=status.HTTP_400_BAD_REQUEST
                        )
                    OrderedPerishablePurchaseSKU.objects.create(
                        purchase=serializer.instance,
                        sku=sku_obj,
                        quantity=sku['quantity'],
                        unit_price=sku['unit_price']
                    )
                else:
                    # sku_obj = get_object_or_404(NonPerishableInventory, pk=sku['sku'])
                    try:
                        sku_obj = NonPerishableInventory.objects.get(pk=sku['sku'])
                    except NonPerishableInventory.DoesNotExist:
                        return standard_response(
                            success=False,
                            message=f"No such non-perishable SKU exists with ID: {sku['sku']}.",
                            status_code=status.HTTP_400_BAD_REQUEST
                        )     
                    OrderedNonPerishablePurchaseSKU.objects.create(
                        purchase=serializer.instance,
                        sku=sku_obj,
                        quantity=sku['quantity'],
                        unit_price=sku['unit_price']
                    )
            return standard_response(
                success=True,
                message="Purchase order created successfully.",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        return standard_response(
            success=False,
            message="Failed to create purchase order.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class PurchaseOrderDetailAPIView(APIView):
    """
    Handles retrieve, update, and delete for a single purchase order.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get_object(self, pk):
        try:
            return PurchaseOrder.objects.get(pk=pk)
        except PurchaseOrder.DoesNotExist:
            return None
        
    def designed_error_response(self, message="No such Purchase order exists."):
        return standard_response(
            success=False,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @extend_schema(responses=PurchaseOrderSerializer)
    def get(self, request, pk):
        purchase_order = self.get_object(pk)

        if purchase_order is None:
             return self.designed_error_response()
        
        serializer = PurchaseOrderSerializer(purchase_order)
        return standard_response(
            success=True,
            message="Purchase order retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    @extend_schema(request=PurchaseOrderSerializer)
    def patch(self, request, pk):
        purchase_order = self.get_object(pk)

        if purchase_order is None:
            return self.designed_error_response()

        if "status" in request.data:
            if (
                purchase_order.status in [
                    PurchaseOrder.StatusChoices.RECEIVED,
                    PurchaseOrder.StatusChoices.CANCELLED
                ]
                and request.data["status"] != purchase_order.status
            ):
                return standard_response(
                    success=False,
                    message=f"Cannot change status from '{purchase_order.status}' to '{request.data['status']}'.",
                    data=None,
                    status_code=status.HTTP_409_CONFLICT
                )

        serializer = PurchaseOrderSerializer(
            purchase_order,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Purchase order updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )

        return standard_response(
            success=False,
            message="Failed to update purchase order.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        purchase_order = self.get_object(pk)

        if purchase_order is None:
            return self.designed_error_response()
        if purchase_order.status == PurchaseOrder.StatusChoices.RECEIVED:
            return standard_response(
                success=False,
                message="Cannot delete a purchase order that has already been received.",
                data=None,
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        purchase_order.delete()
        return standard_response(
            success=True,
            message="Purchase order deleted successfully.",
            data=None,
            status_code=status.HTTP_200_OK
        )

class PurchaseOrderItemsView(APIView):


    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]
    
    def get_po(self, pk):
        try:
            return PurchaseOrder.objects.get(pk=pk)
        except PurchaseOrder.DoesNotExist:
            return None
        
    @extend_schema(responses=PurchaseOrderDetailSerializer(many=True))    
    def get(self, request, pk):
        po = self.get_po(pk)

        if po is None:
            return standard_response(
                success=False,
                message="Purchase order not found.",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND
            )

        
        return standard_response(
            success=True,
            message="Purchase order items retrieved successfully.",
            data={"status": po.status,"items": po.get_all_items()},
            status_code=status.HTTP_200_OK
        )

class PurchaseOrderReceiveAPIView(APIView):
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def post(self, request, pk):
        try:
            po = PurchaseOrder.objects.get(pk=pk)
        except PurchaseOrder.DoesNotExist:
            return standard_response(
                success=False,
                message="Purchase order not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        if po.status == PurchaseOrder.StatusChoices.CANCELLED:
            return standard_response(
                success=False,
                message="Cancelled order cannot be received.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        po.status = PurchaseOrder.StatusChoices.RECEIVED
        po.save()

        return standard_response(
            success=True,
            message="Purchase order marked as received.",
            data=PurchaseOrderSerializer(po).data,
            status_code=status.HTTP_200_OK
        )


class PurchaseOrderCancelAPIView(APIView):
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def post(self, request, pk):
        try:
            po = PurchaseOrder.objects.get(pk=pk)
        except PurchaseOrder.DoesNotExist:
            return standard_response(
                success=False,
                message="Purchase order not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        if po.status == PurchaseOrder.StatusChoices.RECEIVED:
            return standard_response(
                success=False,
                message="Received order cannot be cancelled.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        po.status = PurchaseOrder.StatusChoices.CANCELLED
        po.save()

        return standard_response(
            success=True,
            message="Purchase order cancelled successfully.",
            data=PurchaseOrderSerializer(po).data,
            status_code=status.HTTP_200_OK
        )

    
class VendorPurchaseOrderListAPIView(APIView):
    """ Lists all purchase orders for a specific vendor."""

    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get_vendor(self, vendor_id):
        try:
            return Vendor.objects.get(pk=vendor_id)
        except Vendor.DoesNotExist:
            return None

    @extend_schema(responses=PurchaseOrderSerializer(many=True))
    def get(self, request, vendor_id):
        vendor = self.get_vendor(vendor_id)

        if vendor is None:
            return standard_response(
                success=False,
                message="No such vendor exists.",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND
            )

        purchase_orders = PurchaseOrder.objects.filter(vendor_id=vendor_id).order_by('-created_at')
        serializer = PurchaseOrderSerializer(purchase_orders, many=True)

        
        return standard_response(
            success=True,
            message="Purchase orders for vendor retrieved successfully." if len(serializer.data) > 0 else "No purchase orders found for this vendor.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

""" APIs for Ordered Perishable Purchase SKUs"""
class OrderedPerishablePurchaseSKUListCreateAPIView(APIView):
    """
    Handles listing all perishable purchase SKUs and creating a new one.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request):
        """
        GET /api/procurement/perishable-purchase-skus/ : List all perishable purchase SKUs.
        GET /api/procurement/perishable-purchase-skus/?vendor=<vendor_id> : Filter perishable purchase SKUs by vendor.
        GET /api/procurement/perishable-purchase-skus/?sku=<sku_id> : Filter perishable purchase SKUs by SKU.
        GET /api/procurement/perishable-purchase-skus/?po_number=<purchase_order_id> : Filter perishable purchase SKUs by purchase order.
        """
        vendor = request.query_params.get('vendor')
        sku = request.query_params.get('sku')
        po_number = request.query_params.get('po_number')

        queryset = OrderedPerishablePurchaseSKU.objects.all().order_by('-created_at')
        if vendor and vendor.isdigit():
            queryset = queryset.filter(purchase__vendor=int(vendor))
        if sku and sku.isdigit():
            queryset = queryset.filter(sku=int(sku))
        if po_number and po_number.isdigit():
            queryset = queryset.filter(purchase__id=int(po_number))
        serializer = OrderedPerishablePurchaseSKUSerializer(queryset, many=True)

        if not queryset.exists():
            return standard_response(
                success=False,
                message="No perishable purchase SKUs found matching the criteria.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return standard_response(
            success=True, 
            message="Perishable purchase SKUs retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    @extend_schema(request=OrderedPerishablePurchaseSKUSerializer)
    def post(self, request):
        serializer = OrderedPerishablePurchaseSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Perishable purchase SKU created successfully.",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        return standard_response(
            success=False,
            message="Failed to create perishable purchase SKU.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class OrderedPerishablePurchaseSKUDetailAPIView(APIView):
    """
    Handles retrieve, update, and delete for a single perishable purchase SKU.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get_object(self, pk):
        try:
            return OrderedPerishablePurchaseSKU.objects.get(pk=pk)
        except OrderedPerishablePurchaseSKU.DoesNotExist:
            return None
        
    def designed_error_response(self, message="No such OrderedPerishablePurchaseSKU exists."):    
        return standard_response(
            success=False,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )
    def designed_error_response(self, message):
        return standard_response(
            success=False,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND    
        )    

    def get(self, request, pk):
        perishable_purchase_sku = self.get_object(pk)
        if perishable_purchase_sku is None:
            return self.designed_error_response()
        serializer = OrderedPerishablePurchaseSKUSerializer(perishable_purchase_sku)
        return standard_response(
            success=True,
            message="Perishable purchase SKU retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @extend_schema(request=OrderedPerishablePurchaseSKUSerializer)
    def patch(self, request, pk):
        perishable_purchase_sku = self.get_object(pk)

        if perishable_purchase_sku is None:
            return self.designed_error_response()

        # ✅ Prevent changing purchase reference
        if "purchase" in request.data:
            if perishable_purchase_sku.purchase.id != request.data["purchase"]:
                return standard_response(
                    success=False,
                    message="Cannot change the purchase associated with this SKU.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        serializer = OrderedPerishablePurchaseSKUSerializer(
            perishable_purchase_sku,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Perishable purchase SKU updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )

        return standard_response(
            success=False,
            message="Failed to update perishable purchase SKU.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        perishable_purchase_sku = self.get_object(pk)

        if perishable_purchase_sku is None:
            return self.designed_error_response()
        if perishable_purchase_sku.purchase.status == PurchaseOrder.StatusChoices.RECEIVED:
            return standard_response(
                success=False,
                message="Cannot delete a purchase SKU that has already been received!",
                status_code=status.HTTP_403_FORBIDDEN
            )
        perishable_purchase_sku.delete()
        return standard_response(
            success=True,
            message="Perishable purchase SKU deleted successfully.",
            status_code=status.HTTP_200_OK
        )


""" APIs for Ordered Non-Perishable Purchase SKUs"""
class OrderedNonPerishablePurchaseSKUListCreateAPIView(APIView):
    """
    Handles listing all non-perishable purchase SKUs and creating a new one.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request):

        vendor = request.query_params.get('vendor')
        sku = request.query_params.get('sku')

        queryset = OrderedNonPerishablePurchaseSKU.objects.all().order_by('-created_at')
        if vendor and vendor.isdigit():
            queryset = queryset.filter(purchase__vendor=int(vendor))

        if sku and sku.isdigit():
            queryset = queryset.filter(sku=int(sku))

        serializer = OrderedNonPerishablePurchaseSKUSerializer(queryset, many=True)

        if not queryset.exists():
            return standard_response(
                success=False,
                message="No non-perishable purchase SKUs found matching the criteria.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return standard_response(
            success=True,
            message="Non-perishable purchase SKUs retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @extend_schema(request=OrderedNonPerishablePurchaseSKUSerializer)
    def post(self, request):
        serializer = OrderedNonPerishablePurchaseSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Non-perishable purchase SKU created successfully.",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        return standard_response(
            success=False,
            message="Failed to create non-perishable purchase SKU.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class OrderedNonPerishablePurchaseSKUDetailAPIView(APIView):
    """
    Handles retrieve, update, and delete for a single non-perishable purchase SKU.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get_object(self, pk):
        try:
            return OrderedNonPerishablePurchaseSKU.objects.get(pk=pk)
        except OrderedNonPerishablePurchaseSKU.DoesNotExist:
            return None
        
    def designed_error_response(self, message="No such Ordered non-perishable purchase SKU exists."):
        return standard_response(
            success=False,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND    
        )
    def get(self, request, pk):
        non_perishable_purchase_sku = self.get_object(pk)
        if non_perishable_purchase_sku is None:
            return self.designed_error_response()
        serializer = OrderedNonPerishablePurchaseSKUSerializer(non_perishable_purchase_sku)
        return standard_response(
            success=True,
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    @extend_schema(request=OrderedNonPerishablePurchaseSKUSerializer)
    def patch(self, request, pk):
        non_perishable_purchase_sku = self.get_object(pk)

        if non_perishable_purchase_sku is None:
            return self.designed_error_response()

        # Prevent changing purchase reference
        if "purchase" in request.data:
            if non_perishable_purchase_sku.purchase.id != request.data["purchase"]:
                return standard_response(
                    success=False,
                    message="Cannot change the purchase associated with this SKU.",
                    data=None,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        serializer = OrderedNonPerishablePurchaseSKUSerializer(
            non_perishable_purchase_sku,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Non-perishable purchase SKU updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )

        return standard_response(
            success=False,
            message="Failed to update non-perishable purchase SKU.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        non_perishable_purchase_sku = self.get_object(pk)

        if non_perishable_purchase_sku is None:
            return self.designed_error_response()
        if non_perishable_purchase_sku.purchase.status == PurchaseOrder.StatusChoices.RECEIVED:
            return standard_response(
                success=False,
                message="Cannot delete a purchase SKU that has already been received!",
                data=None,
                status_code=status.HTTP_403_FORBIDDEN
            )
        non_perishable_purchase_sku.delete()
        return standard_response(
            success=True,
            message="Non-perishable purchase SKU deleted successfully.",
            data=None,
            status_code=status.HTTP_200_OK
        )


class VendorInvoiceListCreateAPIView(APIView):
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request):
        invoices = VendorInvoice.objects.all().order_by('-created_at')
        serializer = VendorInvoiceSerializer(invoices, many=True)

        if not invoices.exists():
            return standard_response(success=False,
                                     message="No vendor invoices found.",
                                     status_code=status.HTTP_404_NOT_FOUND)
        return standard_response(success=True,
                                  message="Vendor invoices retrieved successfully.",
                                  data=serializer.data,
                                  status_code=status.HTTP_200_OK)

    @extend_schema(
    request=VendorInvoiceSerializer,
    responses=VendorInvoiceSerializer,
    description="Create a vendor invoice and update inventory accordingly."
    )
    def post(self, request):
        po_number = request.data.get("purchase")
        if not po_number:
            return standard_response(success=False,
                                     message="Purchase order ID is required to create a vendor invoice.",
                                     status_code=status.HTTP_400_BAD_REQUEST)
        try:
            purchase_order = PurchaseOrder.objects.get(pk=po_number)
        except PurchaseOrder.DoesNotExist:
            return standard_response(
                success=False,
                message="Purchase order does not exist.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        invoice_image = request.FILES.get("invoice_image")
        po_skus = purchase_order.purchase_set()
        expected_skus_json = {}
        for item in po_skus:
            expected_skus_json[item.sku.name] = item.sku.get_unit_display() if purchase_order.purchase_type == PurchaseOrder.TypeChoices.PERISHABLE else "Pieces"
        file_payload = {
            "file": (invoice_image.name, invoice_image, invoice_image.content_type)
        }
        data_payload = {"expected_skus_json": json.dumps(expected_skus_json)}
        try:
            response = requests.post(OCR_URL, files=file_payload, data=data_payload, timeout=120)
            data = response.json()
            # data = {
            #     'invoice_number': '4242', 
            #     'date': '2021-09-01', 
            #     'items': [
            #         {'mapped_sku': 'Chana Dal', 'quantity': 50.0, 'unit': 'KG', 'price_per_unit': 55.2, 'total_price': 2760.0}, 
            #         {'mapped_sku': 'Chickpea', 'quantity': 5.0, 'unit': 'KG', 'price_per_unit': 140.0, 'total_price': 700.0}, 
            #         {'mapped_sku': 'Oil', 'quantity': 3.0, 'unit': 'Liters', 'price_per_unit': 1338.6, 'total_price': 4015.8},
            #         {'mapped_sku': 'Chana Dal', 'quantity': 5.0, 'unit': 'KG', 'price_per_unit': 145.0, 'total_price': 725.0}, 
            #         {'mapped_sku': 'Masoor Dal', 'quantity': 50.0, 'unit': 'KG', 'price_per_unit': 96.5, 'total_price': 4825.0}, 
            #         {'mapped_sku': 'Oil Can', 'quantity': 100.0, 'unit': 'Liters', 'price_per_unit': 197.5, 'total_price': 19750.0}, 
            #         {'mapped_sku': 'Sugar', 'quantity': 2.0, 'unit': 'Pieces', 'price_per_unit': 1925.0, 'total_price': 3850.0}, 
            #         {'mapped_sku': 'Sabudana - Khichdi', 'quantity': 25.0, 'unit': 'KG', 'price_per_unit': 45.0, 'total_price': 1125.0}, 
            #         {'mapped_sku': 'Sabudana', 'quantity': 30.0, 'unit': 'KG', 'price_per_unit': 44.67, 'total_price': 1340.0}, 
            #         {'mapped_sku': 'Urad Dal', 'quantity': 20.0, 'unit': 'KG', 'price_per_unit': 48.0, 'total_price': 960.0}, 
            #         {'mapped_sku': 'Kidney Beans', 'quantity': 25.0, 'unit': 'KG', 'price_per_unit': 45.0, 'total_price': 1125.0}, 
            #         {'mapped_sku': 'Biscuit', 'quantity': 5.0, 'unit': 'Pieces', 'price_per_unit': 650.0, 'total_price': 3250.0}    
            #     ]}
        except Exception as e:
            return standard_response(success=False,
                                     message=f"Failed to process invoice image: {str(e)}. Please try again later.",
                                     status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
        if response.status_code != 200:
            return standard_response(success=False,
                                     message=f"Failed to extract data from invoice image: {response.status_code}. {response.text}",
                                     status_code=status.HTTP_400_BAD_REQUEST)
        if not data.get("items") or len(data.get("items")) == 0:
            return standard_response(success=False,
                                     message="At least one item must be included in the invoice.",
                                     status_code=status.HTTP_400_BAD_REQUEST)
        invoice_serializer = VendorInvoiceSerializer(data={
            "purchase": po_number,
            "invoice_number": data.get("invoice_number"),
            "delivery_date": data.get("date"),
            "invoice_file": invoice_image
        })
        if invoice_serializer.is_valid():
            invoice_serializer.save()

            if purchase_order.purchase_type == PurchaseOrder.TypeChoices.PERISHABLE:
                for item in data.get("items", []):
                    sku_name = item.get("mapped_sku")
                    if not PerishableSKU.objects.filter(name=sku_name).exists():
                        return standard_response(success=False,
                                                 message=f"Perishable SKU with name '{sku_name}' does not exist.",
                                                 status_code=status.HTTP_404_NOT_FOUND)
                    sku = PerishableSKU.objects.get(name=sku_name)
                    serializer = PerishableInventorySerializer(data={
                        "sku": sku.id,
                        "quantity": item.get("quantity"),
                        "purchase_date": data.get("date")
                    })
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return standard_response(success=False,
                                                 message="Invalid data for perishable inventory item.",
                                                 status_code=status.HTTP_400_BAD_REQUEST)
                delivery_serializer = DeliveredPerishableInventorySerializer(data={
                    "invoice": invoice_serializer.instance.id,
                    "delivered_json": data.get("items")
                })
                if delivery_serializer.is_valid():
                    delivery_serializer.save()
                else:
                    return standard_response(success=False,
                                             message="Invalid data for delivered perishable inventory.",
                                             status_code=status.HTTP_400_BAD_REQUEST)
            else:
                for item in data.get("items", []):
                    sku_name = item.get("mapped_sku")
                    if not NonPerishableInventory.objects.filter(name=sku_name).exists():
                        return standard_response(success=False,
                                                 message=f"Non-perishable inventory item with name '{sku_name}' does not exist.",
                                                 status_code=status.HTTP_404_NOT_FOUND)
                    sku = NonPerishableInventory.objects.get(name=sku_name)
                    if item.get("quantity"):
                        sku.quantity += item.get("quantity")
                        sku.save()
                    else:
                        return standard_response(success=False,
                                                 message=f"Quantity is required for non-perishable inventory item '{sku_name}'.",
                                                 status_code=status.HTTP_400_BAD_REQUEST)
                
                delivery_serializer = DeliveredNonPerishableInventorySerializer(data={
                    "invoice": invoice_serializer.instance.id,
                    "delivered_json": data.get("items")
                })
                if delivery_serializer.is_valid():
                    delivery_serializer.save()
                else:
                    return standard_response(success=False,
                                             message="Invalid data for delivered non-perishable inventory.",
                                             status_code=status.HTTP_400_BAD_REQUEST)
            purchase_order.status = PurchaseOrder.StatusChoices.RECEIVED
            purchase_order.save()
            return standard_response(
                success=True,
                message="Vendor invoice created successfully.",
                data=invoice_serializer.data,
                status_code=status.HTTP_201_CREATED)
        return standard_response(success=False,
                                 message=f"Invalid data for vendor invoice. {invoice_serializer.errors}",
                                 status_code=status.HTTP_400_BAD_REQUEST)

class DeliveredPerishablePurchaseInventoryListAPIView(APIView):
    """APIView for listing and creating perishable purchase SKUs """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request):
        queryset = DeliveredPerishableInventory.objects.all().order_by('-created_at')
        serializer = DeliveredPerishableInventorySerializer(queryset, many=True)
        if not queryset.exists():
            return standard_response(
                success=False,
                message="No delivered perishable purchase SKUs found.",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND
            )
        return standard_response(
            success=True, 
            message="Delivered perishable purchase SKUs found.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    
class DeliveredPerishablePurchaseInventoryDetailAPIView(APIView):
    """APIView for retrieving, updating, and deleting a single perishable purchase SKU"""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request, pk):
        perishable_purchase_sku = DeliveredPerishableInventory.objects.get(pk=pk) if DeliveredPerishableInventory.objects.filter(pk=pk).exists() else None

        if perishable_purchase_sku is None:
            return standard_response(
                success=False,
                message="No such delivered perishable purchase SKU exists.",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = DeliveredPerishableInventorySerializer(perishable_purchase_sku)
        return standard_response(
            success=True,
            message="Delivered perishable purchase SKU found.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )


class DeliveredNonPerishableInventoryListAPIView(APIView):
    """APIView for listing and creating non-perishable purchase SKUs """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request):
        queryset = DeliveredNonPerishableInventory.objects.all().order_by('-created_at')
        serializer = DeliveredNonPerishableInventorySerializer(queryset, many=True)
        if not queryset.exists():
            return standard_response(
                success=False,
                message="No delivered non-perishable purchase SKUs found.",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return standard_response(
            success=True,
            message="Delivered non-perishable purchase SKUs found.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

class DeliveredNonPerishableInventoryDetailAPIView(APIView):
    """APIView for retrieving, updating, and deleting a single non-perishable purchase SKU"""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request, pk):
        non_perishable_purchase_sku = DeliveredNonPerishableInventory(pk=pk) if DeliveredNonPerishableInventory.objects.filter(pk=pk).exists() else None
        if non_perishable_purchase_sku is None:
            return standard_response(
                success=False,
                message="No such delivered non-perishable purchase SKU exists.",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = DeliveredNonPerishableInventorySerializer(non_perishable_purchase_sku)
        return standard_response(
            success=True,
            message="Delivered non-perishable purchase SKU found.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )