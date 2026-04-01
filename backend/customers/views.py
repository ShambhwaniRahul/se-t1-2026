from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from humanresources.models import EmployeeRole
from core.permissions import RequiresRole
from .models import Customer
from .serializers import CustomerSerializer
from utils.response import standard_response


class CustomerListCreateAPIView(APIView):
    """
    Handles customer listing and creation operations.
    Requires OWNER or MANAGER role for access.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER, 
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):
        queryset = Customer.objects.all().order_by('-created_at')
        serializer = CustomerSerializer(queryset, many=True)
        return standard_response(
            success=True,
            message="Customers retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    

class CustomerDetailAPIView(APIView):
    """
    Handles customer retrieve, update, and delete operations.
    Requires OWNER or MANAGER role for access.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER, 
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get_object(self,pk):
        return get_object_or_404(Customer, pk=pk)

    def get(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer)
        if not serializer.data:
            return standard_response(
                success=False,
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return standard_response(
            success=True,
            message="Customer retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def put(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Customer updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        return standard_response(
            success=False,
            message="Invalid data provided.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Customer details updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        return standard_response(
            success=False,
            message="Invalid data provided.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        customer = get_object_or_404(Customer, pk=pk)
        if not customer:
            return standard_response(
                success=False,
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        customer.delete()
        return standard_response(
            success=True,
            message="Customer deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT
        )


class CustomerRegisterView(APIView):
    """
    Registers a new customer.
    Validates OTP prior to saving the serialized customer data.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER, 
        EmployeeRole.RoleChoices.MANAGER
    ]

    def post(self, request):
        otp = request.data.get('OTP')
        
        if not otp:
            return standard_response(
                success=False,
                message="OTP field is strictly required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
        if otp != "123456":
            return standard_response(
                success=False,
                message="Invalid OTP provided.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            refresh = RefreshToken.for_user(customer)
            
            return standard_response(
                success=True,
                message="Customer registered successfully.",
                data={
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'customer': serializer.data,
                },
                status_code=status.HTTP_201_CREATED
            )
          
        return standard_response(
            success=False,
            message="Invalid data provided.",
            status_code=status.HTTP_400_BAD_REQUEST
        )