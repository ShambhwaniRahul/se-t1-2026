from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Employee, EmployeeRole, SalarySlip, SalarySlipBreakdown, Shifts
from logs.models import AttendanceLog
from .serializers import EmployeeSerializer, SalarySlipSerializer, SalarySlipBreakdownSerializer, ShiftSerializer, AttendanceLogSerializer
from core.permissions import RequiresRole
from utils.response import standard_response


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
            return standard_response(
                success=False,
                message="Phone number and password are required.",
                status_code=status.HTTP_400_BAD_REQUEST
                )

        user = authenticate(request, phone_no=phone_no, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return standard_response(
                success=True,
                message="Authentication successful.",
                data={
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'employee': EmployeeSerializer(user).data,
                },
                status_code=status.HTTP_200_OK
            )


        return standard_response(
            success=False,
            message="Authentication failed. Invalid credentials.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class EmployeeRegisterView(APIView):
    """
    Registers a new employee using provided details.
    Expects phone_no, password, and other relevant fields in the request data.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            return standard_response(
                success=True,
                message="Employee registered successfully!",
                data=EmployeeSerializer(employee).data,
                status_code=status.HTTP_201_CREATED
            )
        
        return standard_response(
            success=False,
            message="Failed to register employee.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
