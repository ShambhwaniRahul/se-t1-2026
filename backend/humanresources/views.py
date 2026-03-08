from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Employee
from core.permissions import RequiresRole

class EmployeeLoginView(APIView):
    """
    Authenticates an identity utilizing phone_no and password.
    Issues a JSON Web Token (JWT) pair for authorized sessions.
    """
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        phone_no = request.data.get('phone_no')
        password = request.data.get('password')

        if not phone_no or not password:
            return Response(
                {"detail": "phone_no and password fields are strictly required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, phone_no=phone_no, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        return Response(
            {"detail": "Authentication failed. Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED
        )


class EmployeeRegisterView(APIView):
    """
    Registers a new employee using provided details.
    Expects phone_no, password, and other relevant fields in the request data.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        Employee.RoleChoices.OWNER, 
        Employee.RoleChoices.MANAGER
    ]
    authentication_classes = []

    def post(self, request):
        # Extract required fields from request data

        phone_no = request.data.get('phone_no')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        gender = request.data.get('gender')
        email = request.data.get('email')
        monthly_salary = request.data.get('monthly_salary')
        role = request.data.get('role')

        # Additional fields can be extracted here (e.g., name, email)

        if not phone_no or not password:
            return Response(
                {"detail": "phone_no and password fields are strictly required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user with the same phone_no already exists
        if Employee.objects.filter(phone_no=phone_no).exists():
            return Response(
                {"detail": "An account with this phone number already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a new user instance
        user = Employee.objects.create_user(phone_no=phone_no, password=password)
        # Additional user fields can be set here

        return Response(
            {"detail": "Employee registered successfully."},
            status=status.HTTP_201_CREATED
        )