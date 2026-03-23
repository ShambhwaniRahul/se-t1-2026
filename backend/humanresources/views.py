from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Employee, EmployeeRole
from .serializers import EmployeeSerializer
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
                'employee': EmployeeSerializer(user).data,
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
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        employee = serializer.save()
        return Response(
            {
                "detail": "Employee registered successfully.",
                "employee": EmployeeSerializer(employee).data,
            },
            status=status.HTTP_201_CREATED
        )
