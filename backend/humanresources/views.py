from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Employee, EmployeeRole, SalarySlip, SalarySlipBreakdown, Shift
from .serializers import EmployeeSerializer, SalarySlipSerializer, SalarySlipBreakdownSerializer, ShiftSerializer
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


class EmployeeListView(APIView):
    """
    Retrieves a list of all registered employees.
    Accessible only to users with OWNER or MANAGER roles.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class EmployeeDetailView(APIView):
    """Gets details of a specific employee by ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request, pk):
        try:
            employee = Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeeSerializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        try:
            employee = Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeeSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        employee = Employee.objects.get(pk=pk)
        if not employee:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)
        if employee.is_active:
            return Response({"detail": "Cannot delete an active employee. Please deactivate the employee first."}, status=status.HTTP_400_BAD_REQUEST)
        if employee.employeerole_set.filter(role=EmployeeRole.RoleChoices.OWNER).exists():
            return Response({"detail": "Cannot delete the OWNER!"}, status=status.HTTP_400_BAD_REQUEST)        
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SalarySlipListCreateAPIView(APIView):
    """Retrieves a list of all salary slips."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):
        queryset = SalarySlip.objects.all().order_by('-created_at')

        # Date Filter
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Amount Filters
        min_amount = request.query_params.get('min_amount')
        max_amount = request.query_params.get('max_amount')

        if start_date:
            queryset = queryset.filter(date_paid__gte=start_date)
        if end_date:
            queryset = queryset.filter(date_paid__lte=end_date)
        if min_amount:
            queryset = queryset.filter(total_amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(total_amount__lte=max_amount)

        serializer = SalarySlipSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = SalarySlipSerializer(data=request.data)
        if serializer.is_valid():
            salary_slip = serializer.save()
            return Response(SalarySlipSerializer(salary_slip).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SalarySlipDetailAPIView(APIView):
    """Retrieves details of a specific salary slip by ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request, pk):
        try:
            salary_slip = SalarySlip.objects.get(pk=pk)
        except SalarySlip.DoesNotExist:
            return Response({"detail": "Salary slip not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SalarySlipSerializer(salary_slip)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        try:
            salary_slip = SalarySlip.objects.get(pk=pk)
        except SalarySlip.DoesNotExist:
            return Response({"detail": "Salary slip not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SalarySlipSerializer(salary_slip, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        salary_slip = SalarySlip.objects.get(pk=pk)
        if not salary_slip:
            return Response({"detail": "Salary slip not found."}, status=status.HTTP_404_NOT_FOUND)
        salary_slip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class SalarySlipBreakdownListAPIView(APIView):
    """Retrieves a list of all salary slip breakdowns."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]
    
    def get(self, request):
        queryset = SalarySlipBreakdown.objects.all().order_by('-created_at')
        serializer = SalarySlipBreakdownSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SalarySlipBreakdownSerializer(data=request.data)
        if serializer.is_valid():
            breakdown = serializer.save()
            return Response(SalarySlipBreakdownSerializer(breakdown).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class SalarySlipBreakdownDetailAPIView(APIView):
    """Retrieves details of a specific salary slip breakdown by ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request, pk):
        try:
            breakdown = SalarySlipBreakdown.objects.get(pk=pk)
        except SalarySlipBreakdown.DoesNotExist:
            return Response({"detail": "Salary slip breakdown not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SalarySlipBreakdownSerializer(breakdown)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        try:
            breakdown = SalarySlipBreakdown.objects.get(pk=pk)
        except SalarySlipBreakdown.DoesNotExist:
            return Response({"detail": "Salary slip breakdown not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SalarySlipBreakdownSerializer(breakdown, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        breakdown = SalarySlipBreakdown.objects.get(pk=pk)
        if not breakdown:
            return Response({"detail": "Salary slip breakdown not found."}, status=status.HTTP_404_NOT_FOUND)
        breakdown.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class ShiftListCreateAPIView(APIView):
    """Retrieves a list of all shifts."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]
    
    def get(self, request):
        queryset = Shift.objects.all().order_by('-created_at')
        serializer = ShiftSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ShiftSerializer(data=request.data)
        if serializer.is_valid():
            shift = serializer.save()
            return Response(ShiftSerializer(shift).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ShiftDetailAPIView(APIView):
    """Retrieves details of a specific shift by ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request, pk):
        try:
            shift = Shift.objects.get(pk=pk)
        except Shift.DoesNotExist:
            return Response({"detail": "Shift not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ShiftSerializer(shift)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        try:
            shift = Shift.objects.get(pk=pk)
        except Shift.DoesNotExist:
            return Response({"detail": "Shift not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ShiftSerializer(shift, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        shift = Shift.objects.get(pk=pk)
        if not shift:
            return Response({"detail": "Shift not found."}, status=status.HTTP_404_NOT_FOUND)
        shift.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)