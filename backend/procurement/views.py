from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import (
    Vendor, PurchaseOrder,
    OrderedNonPerishablePurchaseSKU, OrderedPerishablePurchaseSKU,
    DeliveredPerishableInventory, DeliveredNonPerishableInventory,
    )
from .serializers import (
    VendorSerializer, PurchaseOrderSerializer,
     OrderedPerishablePurchaseSKUSerializer, OrderedNonPerishablePurchaseSKUSerializer,
     DeliveredPerishableInventorySerializer, DeliveredNonPerishableInventorySerializer)
from core.permissions import RequiresRole
from humanresources.models import EmployeeRole
from django.shortcuts import get_object_or_404

# Create your views here.

""" APIs for Vendors"""
class VendorListCreateAPIView(APIView):
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):
        vendors = Vendor.objects.all()
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VendorDetailAPIView(APIView):
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request, pk):
        vendor = get_object_or_404(Vendor, pk=pk)
        serializer = VendorSerializer(vendor)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        vendor = get_object_or_404(Vendor, pk=pk)
        serializer = VendorSerializer(vendor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        vendor = get_object_or_404(Vendor, pk=pk)
        vendor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        # ✅ Enforce default status = Pending
        if 'status' in request.data and request.data.get("status") != PurchaseOrder.StatusChoices.PENDING:
            return Response(
                {"error": "New purchase orders must have status 'Pending'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PurchaseOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(status=PurchaseOrder.StatusChoices.PENDING)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    def get(self, request, pk):
        purchase_order = get_object_or_404(PurchaseOrder, pk=pk)
        serializer = PurchaseOrderSerializer(purchase_order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        purchase_order = get_object_or_404(PurchaseOrder, pk=pk)

        if "status" in request.data:
            if (
                purchase_order.status in [
                    PurchaseOrder.StatusChoices.RECEIVED,
                    PurchaseOrder.StatusChoices.CANCELLED
                ]
                and request.data["status"] != purchase_order.status
            ):
                return Response(
                    {
                        "error": f"Cannot change status from '{purchase_order.status}' to '{request.data['status']}'."
                    },
                    status=status.HTTP_409_CONFLICT
                    )

        serializer = PurchaseOrderSerializer(
            purchase_order,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        purchase_order = get_object_or_404(PurchaseOrder, pk=pk)
        purchase_order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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
        """
        vendor = request.query_params.get('vendor')
        sku = request.query_params.get('sku')

        queryset = OrderedPerishablePurchaseSKU.objects.all().order_by('-created_at')
        if vendor and vendor.isdigit():
            queryset = queryset.filter(purchase__vendor=int(vendor))
        if sku and sku.isdigit():
            queryset = queryset.filter(sku=int(sku))
        serializer = OrderedPerishablePurchaseSKUSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = OrderedPerishablePurchaseSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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

    def get(self, request, pk):
        perishable_purchase_sku = get_object_or_404(OrderedPerishablePurchaseSKU, pk=pk)
        serializer = OrderedPerishablePurchaseSKUSerializer(perishable_purchase_sku)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        perishable_purchase_sku = get_object_or_404(OrderedPerishablePurchaseSKU, pk=pk)

        # ✅ Prevent changing purchase reference
        if "purchase" in request.data:
            if perishable_purchase_sku.purchase.id != request.data["purchase"]:
                return Response(
                    {"error": "Cannot change the purchase associated with this SKU."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = OrderedPerishablePurchaseSKUSerializer(
            perishable_purchase_sku,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        perishable_purchase_sku = get_object_or_404(OrderedPerishablePurchaseSKU, pk=pk)
        if perishable_purchase_sku.purchase.status == PurchaseOrder.StatusChoices.RECEIVED:
            return Response(
                {"error": "Cannot delete a purchase SKU that belongs to a received purchase order."},
                status=status.HTTP_403_FORBIDDEN
            )
        perishable_purchase_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = OrderedNonPerishablePurchaseSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    def get(self, request, pk):
        non_perishable_purchase_sku = get_object_or_404(OrderedNonPerishablePurchaseSKU, pk=pk)
        serializer = OrderedNonPerishablePurchaseSKUSerializer(non_perishable_purchase_sku)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        non_perishable_purchase_sku = get_object_or_404(OrderedNonPerishablePurchaseSKU, pk=pk)

        # Prevent changing purchase reference
        if "purchase" in request.data:
            if non_perishable_purchase_sku.purchase.id != request.data["purchase"]:
                return Response(
                    {"details": "Cannot change the purchase associated with this SKU."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = OrderedNonPerishablePurchaseSKUSerializer(
            non_perishable_purchase_sku,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        non_perishable_purchase_sku = get_object_or_404(OrderedNonPerishablePurchaseSKU, pk=pk)
        if non_perishable_purchase_sku.purchase.status == PurchaseOrder.StatusChoices.RECEIVED:
            return Response(
                {"details": "Cannot delete a purchase SKU that belongs to a received purchase order."},
                status=status.HTTP_403_FORBIDDEN
            )
        non_perishable_purchase_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class DeliveredPerishablePurchaseInventoryListCreateAPIView(APIView):
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
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data_list = request.data
    
        # Ensure list input
        if not isinstance(data_list, list):
            return Response(
                {"error": "Expected a list of items"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        created_items = []
        errors = []
    
        for index, item in enumerate(data_list):
            serializer = DeliveredPerishableInventorySerializer(data=item)
    
            if serializer.is_valid():
                try:
                    obj = serializer.save()
                    created_items.append(
                        DeliveredPerishableInventorySerializer(obj).data
                    )
                except Exception as e:
                    errors.append({
                        "index": index,
                        "item": item,
                        "errors": str(e)
                    })
            else:
                errors.append({
                    "index": index,
                    "item": item,
                    "errors": serializer.errors
                })
    
        return Response({
            "created": created_items,
            "errors": errors
        }, status=status.HTTP_201_CREATED)

    
class DeliveredPerishablePurchaseInventoryDetailAPIView(APIView):
    """APIView for retrieving, updating, and deleting a single perishable purchase SKU"""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request, pk):
        perishable_purchase_sku = get_object_or_404(DeliveredPerishableInventory, pk=pk)
        serializer = DeliveredPerishableInventorySerializer(perishable_purchase_sku)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        perishable_purchase_sku = get_object_or_404(DeliveredPerishableInventory, pk=pk)
        serializer = DeliveredPerishableInventorySerializer(
            perishable_purchase_sku,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        perishable_purchase_sku = get_object_or_404(DeliveredPerishableInventory, pk=pk)
        perishable_purchase_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class DeliveredNonPerishableInventoryListCreateAPIView(APIView):
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
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data_list = request.data
    
        # Ensure list input
        if not isinstance(data_list, list):
            return Response(
                {"error": "Expected a list of items"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        created_items = []
        errors = []
    
        for index, item in enumerate(data_list):
            serializer = DeliveredNonPerishableInventorySerializer(data=item)
    
            if serializer.is_valid():
                try:
                    obj = serializer.save()
                    created_items.append(
                        DeliveredNonPerishableInventorySerializer(obj).data
                    )
                except Exception as e:
                    errors.append({
                        "index": index,
                        "item": item,
                        "errors": str(e)
                    })
            else:
                errors.append({
                    "index": index,
                    "item": item,
                    "errors": serializer.errors
                })
    
        return Response({
            "created": created_items,
            "errors": errors
        }, status=status.HTTP_201_CREATED)