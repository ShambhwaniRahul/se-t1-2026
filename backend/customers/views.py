from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from humanresources.models import Employee
from core.permissions import RequiresRole
from .models import Customer
from .serializers import CustomerSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class CustomerViewSet(viewsets.ModelViewSet):
    """
    Provides standard REST API endpoints for Customer entities.
    Handles GET (list/retrieve), POST (create), PUT/PATCH (update), and DELETE operations.
    """
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [RequiresRole]  # If we pass in nothing in the required_roles list, everyone will have the authentication to view this.
    required_roles = [
        Employee.RoleChoices.OWNER, 
        Employee.RoleChoices.MANAGER
    ]


class CustomerLoginView(APIView):
    """
    Authenticates a customer using phone_no and password.
    Issues a JSON Web Token (JWT) pair for authorized sessions.
    """
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        phone_no = request.data.get('phone_no')
        password = request.data.get('OTP')

        if not phone_no or not password:
            return Response(
                {"detail": "phone_no and OTP fields are strictly required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not phone_no in Customer.objects.values_list('phone_no', flat=True):
        # if not Customer.objects.filter(phone_no=phone_no).exists():  # This one's more efficient.    
            return Response(
                {"detail": "No customer found with the provided phone_no."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # For demonstration, we are not implementing actual OTP verification logic here.
        if password == "123456":  # Placeholder for OTP verification
            customer = Customer.objects.get(phone_no=phone_no)
            serializer = CustomerSerializer(customer)
            refresh = RefreshToken.for_user(customer)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'customer': serializer.data,
            }, status=status.HTTP_200_OK)
        return Response(
            {"detail": "Authentication failed. Invalid OTP."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
class CustomerRegisterView(APIView):
    """
    Registers a new customer using provided details.
    Expects phone_no and other relevant fields in the request data.
    """
    permission_classes = []
    def post(self, request):
        password = request.data.get('OTP')
        if not password:
            return Response(
                {"detail": "OTP field is strictly required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if password != "123456":  # Placeholder for OTP verification
            return Response(
                {"detail": "Invalid OTP provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = CustomerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        customer = serializer.save()
        refresh = RefreshToken.for_user(customer)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'customer': serializer.data,
        }, status=status.HTTP_201_CREATED)
