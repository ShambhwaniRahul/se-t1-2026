from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from humanresources.models import EmployeeRole
from core.permissions import RequiresRole
from .models import Customer
from .serializers import CustomerSerializer


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
        return Response(serializer.data, status=status.HTTP_200_OK)
    

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
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        customer = self.get_object(pk)
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
            return Response(
                {"detail": "OTP field is strictly required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if otp != "123456":
            return Response(
                {"detail": "Invalid OTP provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            refresh = RefreshToken.for_user(customer)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'customer': serializer.data,
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)