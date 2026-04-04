from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from humanresources.models import EmployeeRole
from core.permissions import RequiresRole
from .models import Customer, CustomerPayment
from .serializers import CustomerSerializer, CustomerPaymentSerializer
from orders.models import Order, OrderMenuItem
from utils.response import standard_response


class CustomerListCreateAPIView(APIView):
    """
    Handles customer listing and creation operations.
    Requires OWNER or MANAGER role for access.
    """

    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    def get(self, request):
        min_loyalty_points = request.query_params.get("min_loyalty_points")
        queryset = Customer.objects.all().order_by("-created_at")
        if min_loyalty_points and min_loyalty_points.strip().isnumeric():
            queryset = queryset.filter(loyalty_points__gte=int(min_loyalty_points))
        serializer = CustomerSerializer(queryset, many=True)

        if not queryset.exists():
            return standard_response(
                success=False,
                message="No customers found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return standard_response(
            success=True,
            message="Customers retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )


class CustomerDetailAPIView(APIView):
    """
    Handles customer retrieve, update, and delete operations.
    Requires OWNER or MANAGER role for access.
    """

    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    def get_object(self, pk):
        return get_object_or_404(Customer, pk=pk)

    def get(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer)
        if not serializer.data:
            return standard_response(
                success=False,
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return standard_response(
            success=True,
            message="Customer retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Customer updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK,
            )
        return standard_response(
            success=False,
            message="Invalid data provided.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Customer updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK,
            )
        return standard_response(
            success=False,
            message="Invalid data provided.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        customer = self.get_object(pk)
        customer.delete()
        if not customer:
            return standard_response(
                success=False,
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return standard_response(
            success=True,
            message="Customer deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT,
        )


class CustomerRegisterView(APIView):
    """
    Registers a new customer.
    Validates OTP prior to saving the serialized customer data.
    """

    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    def post(self, request):
        # otp = request.data.get("OTP")
        # if not otp:
        #     return Response(
        #         {"detail": "OTP field is strictly required."},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )
        # if otp != "123456":
        #     return Response(
        #         {"detail": "Invalid OTP provided."}, status=status.HTTP_400_BAD_REQUEST
        #     )

        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            return standard_response(
                status_code=status.HTTP_201_CREATED,
                success=True,
                message="Customer created successfully.",
                data=serializer.data,
            )

        return standard_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            success=False,
            message="Invalid data provided.",
            data=serializer.errors,
        )


class CustomerPaymentListAPIView(APIView):
    """
    Lists all customer payments.
    Requires OWNER or MANAGER role for access.
    """

    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    def get(self, request):
        payment_mode = request.query_params.get("payment_mode")
        usage_type = request.query_params.get("usage_type")
        payments = CustomerPayment.objects.all().order_by("-created_at")

        if payment_mode and payment_mode.strip().isnumeric():
            payments = payments.filter(payment_mode=int(payment_mode.strip()))

        if usage_type and usage_type.strip().isnumeric():
            payments = payments.filter(usage_type=int(usage_type.strip()))

        serializer = CustomerPaymentSerializer(payments, many=True)

        if not payments.exists():
            return standard_response(
                success=False,
                message="Invalid query parameters provided.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return standard_response(
            success=True,
            message="Customer payments retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = CustomerPaymentSerializer(data=request.data)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data provided.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = serializer.validated_data
        order = validated_data.get("order")

        # 🔥 1. Check if order exists (already ensured by serializer FK)

        # 🔥 2. Check if order already closed
        if order.status == Order.StatusChoices.CLOSED:
            return standard_response(
                success=False,
                message="Order is already closed.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # 🔥 3. Check pending/incomplete items
        invalid_items = order.ordermenuitem_set.filter(
            menu_item_status__in=[
                OrderMenuItem.StatusChoices.PENDING,
                OrderMenuItem.StatusChoices.IN_PROGRESS,
                OrderMenuItem.StatusChoices.READY_TO_SERVE,
            ]
        )

        if invalid_items.exists():
            return standard_response(
                success=False,
                message="Cannot process payment. Some order items are not yet completed.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # 🔥 4. Save payment
        payment = serializer.save()

        # 🔥 5. Close order
        order.status = Order.StatusChoices.CLOSED
        order.save()

        return standard_response(
            success=True,
            message="Payment successful. Order closed.",
            data={
                "payment_id": payment.id,
                "order_id": order.id,
                "final_total": order.final_total,
            },
            status_code=status.HTTP_201_CREATED,
        )


class CustomerPaymentDetailAPIView(APIView):
    """
    Retrieves details of a specific customer payment.
    """

    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    def get(self, request, pk):
        payment = get_object_or_404(CustomerPayment, pk=pk)
        serializer = CustomerPaymentSerializer(payment)

        if not serializer.data:
            return standard_response(
                success=False,
                message="Customer payment not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return standard_response(
            success=True,
            message="Customer payment retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )
