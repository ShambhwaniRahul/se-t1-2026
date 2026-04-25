from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from humanresources.models import EmployeeRole
from core.permissions import RequiresRole
from .models import Customer, CustomerPayment, CustomerPointsBank
from .serializers import (
    CustomerSerializer, CustomerReadSerializer,
    CustomerPaymentSerializer, CustomerPointsBankSerializer,
    PointsBankUserSerializer, CustomerPaymentReadSerializer, CustomerSearchSerializer,
    CustomerOrdersSerializer)
from orders.models import Order, OrderMenuItem, DiningTable
from utils.response import standard_response, paginated_response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from utils.loyalty_points import Converter, compute_adjusted_amount
from django.db import transaction 
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q  # Imported for multi-column searching

class CustomerListAPIView(APIView):
    """
    Handles customer listing and creation operations.
    Requires OWNER or MANAGER role for access.
    """
    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    @extend_schema(
        responses=CustomerReadSerializer,
        parameters=[
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                description="Search term to filter customers by name or phone number.",
                required=False
            )
        ]
    )
    def get(self, request):
        min_loyalty_points = request.query_params.get("min_loyalty_points")
        search_term = request.query_params.get("search", "")
        
        queryset = Customer.objects.all().order_by("-created_at")
        
        # Apply global text search filter across multiple fields using Q objects
        if search_term:
            queryset = queryset.filter(
                Q(first_name__icontains=search_term) |
                Q(last_name__icontains=search_term) |
                Q(phone_no__icontains=search_term)
            )

        if min_loyalty_points and min_loyalty_points.strip().isnumeric():
            queryset = queryset.filter(loyalty_points__gte=int(min_loyalty_points))

        return paginated_response(
            queryset=queryset,
            request=request,
            serializer_class=CustomerReadSerializer,
            message="Customers retrieved successfully."
        )


class CustomerDetailAPIView(APIView):
    """
    Handles customer retrieve, update, and delete operations.
    Requires OWNER or MANAGER role for access.
    """
    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    def get_object(self, pk):
        try:
            return Customer.objects.get(pk=pk)
        except Customer.DoesNotExist:
            return None
            
    def standard_error_response(self, message="No such customer exists.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )
    
    @extend_schema(
        responses=CustomerReadSerializer
    )
    def get(self, request, pk):
        customer = self.get_object(pk)
        if customer is None:
            return self.standard_error_response()
            
        serializer = CustomerReadSerializer(customer)
        return standard_response(
            success=True,
            message="Customer retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )
    
    @extend_schema(
        request=CustomerSerializer,
    )
    def patch(self, request, pk):
        customer = self.get_object(pk)
        if customer is None:
            return self.standard_error_response()
            
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
        if customer is None:
            return self.standard_error_response()
            
        customer.delete()
        return standard_response(
            success=True,
            message="Customer deleted successfully.",
            status_code=status.HTTP_200_OK,
        )


class CustomerRegisterView(APIView):
    """
    Registers a new customer.
    Validates OTP prior to saving the serialized customer data.
    """
    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    @extend_schema(
        request=CustomerSerializer
    )
    def post(self, request):
        phone = request.data.get("phone_no")
    
        if not phone:
            return standard_response(
                success=False,
                message="Phone number is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        serializer = CustomerSerializer(data=request.data)
    
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Customer created successfully.",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED
            )
    
        return standard_response(
            success=False,
            message="Invalid data provided.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class CustomerSearchAPIView(APIView):
    """
    Handles customer search operations by explicit parameters.
    Requires OWNER, MANAGER or WAITER role for access.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER
    ]

    @extend_schema(
        responses = CustomerSearchSerializer
    ) 
    def get(self, request):
        phone_no = request.query_params.get("phone_no")
        first_name = request.query_params.get("first_name")
        last_name = request.query_params.get("last_name")

        if not phone_no and not first_name and not last_name:
            return standard_response(
                success=False,
                message="At least one search parameter (phone_no, first_name, last_name) is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        queryset = Customer.objects.all().order_by("-created_at")
        
        if phone_no:
            queryset = queryset.filter(phone_no=phone_no)
        if first_name:
            queryset = queryset.filter(first_name__icontains=first_name)
        if last_name:
            queryset = queryset.filter(last_name__icontains=last_name)

        return paginated_response(
            queryset=queryset,
            request=request,
            serializer_class=CustomerReadSerializer,
            message="Customers retrieved successfully."
        )
    

class CustomerOrdersListAPIView(APIView):
    """Retrieve orders of a customer along with their items."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER,
    ]

    def get_customer(self, customer_id):
        return Customer.objects.filter(id=customer_id).first()

    @extend_schema(responses=CustomerOrdersSerializer(many=True))
    def get(self, request, pk):
        customer = self.get_customer(pk)

        if not customer:
            return standard_response(
                success=False,
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        orders = (
            Order.objects.filter(customerpayment__customer=customer)
            .prefetch_related("items__menu_item")
            .order_by("-created_at")
        )

        return paginated_response(
            queryset=orders,
            request=request,
            serializer_class=CustomerOrdersSerializer,
            message="Customer orders retrieved successfully.",
            default_size=5 
        )


class CustomerPaymentListCreateAPIView(APIView):
    """
    Lists all customer payments.
    Requires OWNER or MANAGER role for access.
    """
    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    @extend_schema(
        responses=CustomerPaymentSerializer(many=True),
        parameters=[
            OpenApiParameter(
                name="payment_mode",
                type=OpenApiTypes.INT,
                description="Filter by payment mode. Values are 0:CASH, 1:UPI, 2:CARD"
            ),
            OpenApiParameter(
                name="usage_type",
                type=OpenApiTypes.INT,
                description="Filter by usage type. Values are -1:Invalid,1:Valid"
            )
        ]
    )
    def get(self, request):
        payment_mode = request.query_params.get("payment_mode")
        usage_type = request.query_params.get("usage_type")
        payments = CustomerPayment.objects.all().order_by("-created_at")

        if payment_mode and payment_mode.strip().isnumeric():
            payments = payments.filter(payment_mode=int(payment_mode.strip()))

        if usage_type and usage_type.strip().isnumeric():
            payments = payments.filter(usage_type=int(usage_type.strip()))

        return paginated_response(
            queryset=payments,
            request=request,
            serializer_class=CustomerPaymentReadSerializer,
            message="Customer payments retrieved successfully."
        )

    @extend_schema(request=CustomerPaymentSerializer)
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
        customer = validated_data.get("customer")
    
        if order.status == Order.StatusChoices.CLOSED:
            return standard_response(
                success=False,
                message="Order is already closed.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
    
        invalid_items = order.items.filter(
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
    
        try:
            with transaction.atomic():
                is_redeeming = request.data.get("is_redeeming")
                discount = request.data.get("discount")
                
                if discount > 30:
                    return standard_response(
                        success=False,
                        message="Discount cannot be greater than 30%.",
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )
                    
                result = compute_adjusted_amount(final_total=order.final_total, customer_id=customer.id, is_redeeming=is_redeeming, discount=discount)

                amt_paid = result["amt_paid"]
                points_adjusted = result["points_used"]

                payment = serializer.save(amt_paid=amt_paid)
    
                order.status = Order.StatusChoices.CLOSED
                order.save()

                DiningTable.objects.filter(id=order.table.id).update(is_available=True)
                
                CustomerPointsBank.objects.create(
                    payment=payment,
                    points=order.final_total * Converter.RUPEES_TO_POINTS.value
                )
    
            return standard_response(
                success=True,
                message="Payment successful. Order closed.",
                data={
                    "customer_name": customer.full_name,
                    "order_total": order.final_total,
                    "points_adjusted": points_adjusted,
                    "gross_value": amt_paid,
                    "points_to_rupees": Converter.POINTS_TO_RUPEES.value
                },
                status_code=status.HTTP_201_CREATED,
            )
    
        except Exception as e:
            return standard_response(
                success=False,
                message="Payment failed.",
                data=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class CustomerPaymentDetailAPIView(APIView):
    """
    Retrieves a paginated list of payments for a specific customer.
    """
    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]    
    
    def get_customer(self, customer_id):
        try:
            return Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return None
            
    def get(self, request, customer_id):
        customer = self.get_customer(customer_id)
        
        if not customer:
            return standard_response(
                success=False,
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
            
        payments = CustomerPayment.objects.filter(customer=customer).order_by("-created_at")

        return paginated_response(
            queryset=payments,
            request=request,
            serializer_class=CustomerPaymentReadSerializer,
            message="Customer payments retrieved successfully."
        )

class CustomerPointsBankListAPIView(APIView):
    """
    Retrieves a paginated list of point bank entries for a specific customer.
    """
    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    def get(self, request, customer_id):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        queryset = CustomerPointsBank.objects.filter(
            payment__customer__id=customer_id,
            payment__order__created_at__gte=thirty_days_ago
        ).select_related("payment", "payment__customer", "payment__order").order_by("-created_at")

        return paginated_response(
            queryset=queryset,
            request=request,
            serializer_class=PointsBankUserSerializer,
            message="Customer points fetched successfully."
        )