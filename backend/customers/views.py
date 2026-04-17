from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from humanresources.models import EmployeeRole
from core.permissions import RequiresRole
from .models import Customer, CustomerPayment, CustomerPointsBank
from .serializers import CustomerSerializer,CustomerReadSerializer,CustomerPaymentSerializer
from orders.models import Order, OrderMenuItem
from utils.response import standard_response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from utils.loyalty_points import Converter, compute_adjusted_amount
from django.db import transaction 


class CustomerListCreateAPIView(APIView):
    """
    Handles customer listing and creation operations.
    Requires OWNER or MANAGER role for access.
    """

    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]

    
    @extend_schema(
        responses=CustomerReadSerializer
        )
    def get(self, request):
        min_loyalty_points = request.query_params.get("min_loyalty_points")
        queryset = Customer.objects.all().order_by("-created_at")
        if min_loyalty_points and min_loyalty_points.strip().isnumeric():
            queryset = queryset.filter(loyalty_points__gte=int(min_loyalty_points))
        serializer = CustomerReadSerializer(queryset, many=True)

        return standard_response(
            success=True,
            message="Customers retrieved successfully." if len(queryset)>0 else "No customers found for the given Parameters.",
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
        responses=CustomerSerializer
    )
    def get(self, request, pk):
        customer = self.get_object(pk)
        if customer is None:
            return self.standard_error_response()
        serializer = CustomerSerializer(customer)
        return standard_response(
            success=True,
            message="Customer retrieved successfully.",
            data={serializer.data},
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
            status_code=status.HTTP_204_NO_CONTENT,
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
        """
        Registers a new customer.
        """
        phone = request.data.get("phone_no")
    
        # 🔥 1. Basic validation
        if not phone:
            return standard_response(
                success=False,
                message="Phone number is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
   
        serializer = CustomerSerializer(data=request.data)
    
        if serializer.is_valid():
            serializer.save()
            # print(serializer.vadata)
    
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
    Handles customer search operations.
    Requires OWNER, MANAGER or WAITER role for access.
    """

    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER
        ]

    
    def get(self, request):
        phone_no = request.data.get("phone_no")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")

        queryset = Customer.objects.all().order_by("-created_at")
        if phone_no:
            queryset = queryset.filter(phone_no=phone_no)
        if first_name:
            queryset = queryset.filter(first_name__icontains=first_name)
        if last_name:
            queryset = queryset.filter(last_name__icontains=last_name)

        serializer = CustomerSerializer(queryset, many=True)

        return standard_response(
            success=True,
            message="Customers retrieved successfully." if len(queryset)>0 else "No customers found for the given Parameters.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
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

        serializer = CustomerPaymentSerializer(payments, many=True)
        print("Data: ", serializer.data)


        return standard_response(
            success=True,
            message="Customer payments retrieved successfully" if len(payments)>0 else "No customer payments found for the given parameters.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
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
    
        # 🔥 1. Check if order already closed
        if order.status == Order.StatusChoices.CLOSED:
            return standard_response(
                success=False,
                message="Order is already closed.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
    
        # 🔥 2. Check pending/incomplete items
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
    
        try:
            with transaction.atomic():
    
                # 🔥 3. Compute adjusted amount using loyalty points
                result = compute_adjusted_amount(
                    final_total=order.final_total,
                    customer_id=customer.id
                )
    
                amt_paid = result["amt_paid"]
                points_adjusted = result["points_used"] 
    
                # 🔥 4. Save payment with computed amt_paid
                payment = serializer.save(amt_paid=amt_paid)
    
                # 🔥 5. Close order
                order.status = Order.StatusChoices.CLOSED
                order.save()
                
                # 6. Making an entry into the CustomerPointsBank table
                CustomerPointsBank.objects.create(
                    payment=payment,
                    points=amt_paid * Converter.RUPEES_TO_POINTS.value
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
    Retrieves details of a specific customer payment.
    """

    permission_classes = [RequiresRole]
    required_roles = [EmployeeRole.RoleChoices.OWNER, EmployeeRole.RoleChoices.MANAGER]    

    def get(self, request, pk):
        customer_id = request.query_params.get("customer_id")
        if not customer_id or not customer_id.strip().isnumeric():
            return standard_response(
                success=False,
                message="Customer ID is required and must be numeric.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        payment = CustomerPayment.objects.get(pk=pk, customer_id=int(customer_id.strip()))
        serializer = CustomerPaymentSerializer(payment)

        if not serializer.data:
            return standard_response(
                success=False,
                message="Customer payment not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return standard_response(
            success=True,
            message="Customer payments retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )
