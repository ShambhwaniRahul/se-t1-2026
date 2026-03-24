from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Vendor, PurchaseOrder, PerishablePurchaseSKU, NonPerishablePurchaseSKU
from .serializers import VendorSerializer, PurchaseOrderSerializer, PerishablePurchaseSKUSerializer, NonPerishablePurchaseSKUSerializer
from core.permissions import RequiresRole
from humanresources.models import EmployeeRole
from django.shortcuts import get_object_or_404

# Create your views here.
class VendorListCreateView(APIView):
    """Handles listing all vendors and creating a new vendor."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request, pk=None):
        if pk is None:
            vendors = Vendor.objects.all()
            serializer = VendorSerializer(vendors, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            vendor = get_object_or_404(Vendor, pk=pk)
            serializer = VendorSerializer(vendor)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request,pk):
        vendor = get_object_or_404(Vendor, pk=pk)
        serializer = VendorSerializer(vendor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request,pk):
        print(pk)
        vendor = get_object_or_404(Vendor, pk=pk)
        print("Vendor to be deleted: ",vendor)
        vendor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class PurchaseOrderListCreateView(APIView):
    """Handles listing all purchase orders and creating a new purchase order."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request, pk=None):
        """If pk is provided, return the specific purchase order, otherwise return all purchase orders."""
        if pk is None:
            purchase_orders = PurchaseOrder.objects.all()
            serializer = PurchaseOrderSerializer(purchase_orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            purchase_order = get_object_or_404(PurchaseOrder, pk=pk)
            serializer = PurchaseOrderSerializer(purchase_order)
            return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        if 'status' in request.data and request.data.get("status") != PurchaseOrder.StatusChoices.PENDING:
            return Response(
                {"error": "New purchase orders must have status 'Pending'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = PurchaseOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def patch(self, request,pk):
        purchase_order = get_object_or_404(PurchaseOrder, pk=pk)
        if "status" in request.data:
            if (
                purchase_order.status in [PurchaseOrder.StatusChoices.RECEIVED, PurchaseOrder.StatusChoices.CANCELLED] and
                request.data["status"] != purchase_order.status
            ):
                return Response(
                    {"error": f"Cannot change status from '{purchase_order.status}' to '{request.data['status']}'."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        serializer = PurchaseOrderSerializer(purchase_order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request,pk):
        purchase_order = get_object_or_404(PurchaseOrder, pk=pk)
        purchase_order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class PerishablePurchaseSKUListCreateView(APIView):
    """Handles listing all perishable purchase SKUs and creating a new perishable purchase SKU."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request, pk=None):
        if pk is None:
            perishable_purchase_skus = PerishablePurchaseSKU.objects.all()
            serializer = PerishablePurchaseSKUSerializer(perishable_purchase_skus, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            perishable_purchase_sku = get_object_or_404(PerishablePurchaseSKU, pk=pk)
            serializer = PerishablePurchaseSKUSerializer(perishable_purchase_sku)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PerishablePurchaseSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def patch(self, request,pk):
        perishable_purchase_sku = get_object_or_404(PerishablePurchaseSKU, pk=pk)
        if "purchase" in request.data:
            if perishable_purchase_sku.purchase.id != request.data["purchase"]:
                return Response(
                    {"error": "Cannot change the purchase associated with this SKU."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        serializer = PerishablePurchaseSKUSerializer(perishable_purchase_sku, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request,pk):
        perishable_purchase_sku = get_object_or_404(PerishablePurchaseSKU, pk=pk)
        perishable_purchase_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class NonPerishablePurchaseSKUListCreateView(APIView):
    """Handles listing all non-perishable purchase SKUs and creating a new non-perishable purchase SKU."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.INVENTORY_MANAGER
    ]

    def get(self, request, pk=None):
        if pk is None:
            non_perishable_purchase_skus = NonPerishablePurchaseSKU.objects.all()
            serializer = NonPerishablePurchaseSKUSerializer(non_perishable_purchase_skus, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            non_perishable_purchase_sku = get_object_or_404(NonPerishablePurchaseSKU, pk=pk)
            serializer = NonPerishablePurchaseSKUSerializer(non_perishable_purchase_sku)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = NonPerishablePurchaseSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def patch(self, request,pk):
        non_perishable_purchase_sku = get_object_or_404(NonPerishablePurchaseSKU, pk=pk)
        if "purchase" in request.data:
            if non_perishable_purchase_sku.purchase.id != request.data["purchase"]:
                return Response(
                    {"error": "Cannot change the purchase associated with this SKU."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        serializer = NonPerishablePurchaseSKUSerializer(non_perishable_purchase_sku, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request,pk):
        non_perishable_purchase_sku = get_object_or_404(NonPerishablePurchaseSKU, pk=pk)
        non_perishable_purchase_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
