from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Employee, EmployeeRole, SalarySlip, SalarySlipBreakdown, Shifts
from logs.models import AttendanceLog
from .serializers import EmployeeSerializer, SalarySlipSerializer, SalarySlipBreakdownSerializer, ShiftSerializer, AttendanceLogSerializer
from core.permissions import RequiresRole
from django.db.models import F
from django.utils.dateparse import parse_datetime
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
        return standard_response(
            success=True,
            message="Employee list retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )


class EmployeeDetailView(APIView):
    """
    Retrieves detailed information about a specific employee by their ID.
    Accessible only to users with OWNER or MANAGER roles.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get_object(self, pk):
        try:
            return Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return None
        
    def standard_error_response(self, message="No such employee exists.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )

    def get(self, request, pk):
        employee = self.get_object(pk)

        if employee is None:
            return self.standard_error_response()
        serializer = EmployeeSerializer(employee)

        return standard_response(
                success=True,
                message="Employee details retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
    
    def patch(self, request, pk):
        employee = self.get_object(pk)

        if not employee:
            return self.standard_error_response()
        serializer = EmployeeSerializer(employee, data=request.data, partial=True)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data provided for update.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if serializer.is_valid():
            updated_employee = serializer.save()
            return standard_response(
                success=True,
                message="Employee details updated successfully.",
                data=EmployeeSerializer(updated_employee).data,
                status_code=status.HTTP_200_OK
            )
        
        return standard_response(
            success=False,
            message="Failed to update employee details.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    

    def delete(self, request, pk):
        employee = self.get_object(pk)

        if employee is None:
            return self.standard_error_response()
        employee.delete()
        return standard_response(
            success=True,
            message="Employee deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT
        )
    

class SalarySlipListCreateAPIView(APIView):
    """
    Handles listing all salary slips and creating new salary slips.
    GET: Retrieves a list of all salary slips.
    POST: Creates a new salary slip with the provided data.
    Accessible only to users with OWNER or MANAGER roles.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):

        min_date_paid = request.query_params.get('min_date_paid')
        max_date_paid = request.query_params.get('max_date_paid')
        transaction_no = request.query_params.get('transaction_no')
        min_amount = request.query_params.get('min_amount')
        max_amount = request.query_params.get('max_amount')

        salary_slips = SalarySlip.objects.all().order_by('-created_at')

        if min_date_paid:
            salary_slips = salary_slips.filter(created_at__gte=min_date_paid)
        if max_date_paid:
            salary_slips = salary_slips.filter(created_at__lte=max_date_paid)
        if transaction_no:
            salary_slips = salary_slips.filter(transaction_no__icontains=transaction_no)   
        if min_amount:
            salary_slips = salary_slips.filter(amount__gte=min_amount)
        if max_amount:
            salary_slips = salary_slips.filter(amount__lte=max_amount)        

        serializer = SalarySlipSerializer(salary_slips, many=True)
        return standard_response(
            success=True,
            message="Salary slips retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = SalarySlipSerializer(data=request.data)
        if serializer.is_valid():
            salary_slip = serializer.save()
            return standard_response(
                success=True,
                message="Salary slip created successfully.",
                data=SalarySlipSerializer(salary_slip).data,
                status_code=status.HTTP_201_CREATED
            )
        
        return standard_response(
            success=False,
            message="Failed to create salary slip.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
class SalarySlipDetailAPIView(APIView):
    """ Handles retrieving, updating, and deleting a specific salary slip by its ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get_object(self, pk):
        try:
            return SalarySlip.objects.get(pk=pk)
        except SalarySlip.DoesNotExist:
            return None

    def standard_error_response(self, message="Salary slip not found.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )    
    
    def get(self, request, pk):
        salary_slip = self.get_object(pk)

        if salary_slip is None:
            return self.standard_error_response()
        serializer = SalarySlipSerializer(salary_slip)

        return standard_response(
                success=True,
                message="Salary slip details retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
    
    def patch(self, request, pk):
        salary_slip = self.get_object(pk)

        if not salary_slip:
            return self.standard_error_response()
        serializer = SalarySlipSerializer(salary_slip, data=request.data, partial=True)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data provided for update.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if serializer.is_valid():
            updated_salary_slip = serializer.save()
            return standard_response(
                success=True,
                message="Salary slip details updated successfully.",
                data=SalarySlipSerializer(updated_salary_slip).data,
                status_code=status.HTTP_200_OK
            )
        
        return standard_response(
            success=False,
            message="Failed to update salary slip details.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    

    def delete(self, request, pk):
        salary_slip = self.get_object(pk)

        if salary_slip is None:
            return self.standard_error_response()
        salary_slip.delete()
        return standard_response(
            success=True,
            message="Salary slip deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT
        )
    

class SalarySlipBreakdownListAPIView(APIView):
    """
    Handles listing all salary slip breakdowns and creating new salary slip breakdowns.
    GET: Retrieves a list of all salary slip breakdowns.
    POST: Creates a new salary slip breakdown with the provided data.
    Accessible only to users with OWNER or MANAGER roles.
    """

    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):
        type = request.query_params.get('type')


        salary_breakdowns = SalarySlipBreakdown.objects.all().order_by('-created_at')

        if type and type.isdigit():
            salary_breakdowns = salary_breakdowns.filter(type=type)
        serializer = SalarySlipBreakdownSerializer(salary_breakdowns, many=True)
        return standard_response(
            success=True,
            message="Salary slip breakdowns retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = SalarySlipBreakdownSerializer(data=request.data)
        if serializer.is_valid():
            salary_breakdown = serializer.save()
            return standard_response(
                success=True,
                message="Salary slip breakdown created successfully.",
                data=SalarySlipBreakdownSerializer(salary_breakdown).data,
                status_code=status.HTTP_201_CREATED
            )
        
        return standard_response(
            success=False,
            message="Failed to create salary slip breakdown.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    

class SalarySlipBreakdownDetailAPIView(APIView):
    """ Handles retrieving, updating, and deleting a specific salary slip breakdown by its ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get_object(self, pk):
        try:
            return SalarySlipBreakdown.objects.get(pk=pk)
        except SalarySlipBreakdown.DoesNotExist:
            return None

    def standard_error_response(self, message="Salary slip breakdown not found.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )    
    
    def get(self, request, pk):
        salary_breakdown = self.get_object(pk)

        if salary_breakdown is None:
            return self.standard_error_response()
        serializer = SalarySlipBreakdownSerializer(salary_breakdown)

        return standard_response(
                success=True,
                message="Salary slip breakdown details retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
    
    def patch(self, request, pk):
        salary_breakdown = self.get_object(pk)

        if not salary_breakdown:
            return self.standard_error_response()
        serializer = SalarySlipBreakdownSerializer(salary_breakdown, data=request.data, partial=True)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data provided for update.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if serializer.is_valid():
            updated_salary_breakdown = serializer.save()
            return standard_response(
                success=True,
                message="Salary slip breakdown details updated successfully.",
                data=SalarySlipBreakdownSerializer(updated_salary_breakdown).data,
                status_code=status.HTTP_200_OK
            )
        
        return standard_response(
            success=False,
            message="Failed to update salary slip breakdown details.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        salary_breakdown = self.get_object(pk)

        if salary_breakdown is None:
            return self.standard_error_response()
        salary_breakdown.delete()
        return standard_response(
            success=True,
            message="Salary slip breakdown deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT
        )
    

class ShiftListCreateAPIView(APIView):
    """
    Handles listing all shifts and creating new shifts.
    GET: Retrieves a list of all shifts.
    POST: Creates a new shift with the provided data.
    Accessible only to users with OWNER or MANAGER roles.
    """

    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):
        shifts = Shifts.objects.all().order_by('-created_at')
        start_time = request.query_params.get('start_time')
        end_time = request.query_params.get('end_time')
        employee_id = request.query_params.get('employee_id')


        if start_time:
            parsed_start = parse_datetime(start_time)
            if parsed_start:
                shifts = shifts.filter(start_time__gte=parsed_start)
        if end_time:
            parsed_end = parse_datetime(end_time)
            if parsed_end:
                shifts = shifts.filter(end_time__lte=parsed_end)
        if employee_id:
            shifts = shifts.filter(employee_id=employee_id)        
        serializer = ShiftSerializer(shifts, many=True)
        return standard_response(
            success=True,
            message="Shifts retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = ShiftSerializer(data=request.data)
        if serializer.is_valid():
            shift = serializer.save()
            return standard_response(
                success=True,
                message="Shift created successfully.",
                data=ShiftSerializer(shift).data,
                status_code=status.HTTP_201_CREATED
            )
        
        return standard_response(
            success=False,
            message="Failed to create shift.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
class ShiftDetailAPIView(APIView):
    """ Handles retrieving, updating, and deleting a specific shift by its ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get_object(self, pk):
        try:
           return Shifts.objects.get(pk=pk)
        except:
            return None
    
    def standard_error_response(self, message="Shift not found.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )
    def get(self, request, pk):
        shift = self.get_object(pk)

        if shift is None:
            return self.standard_error_response()
        
        serializer = ShiftSerializer(shift)

        return standard_response(
                success=True,
                message="Shift details retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
    
    def patch(self, request, pk):
        shift = self.get_object(pk)

        if shift is None:
            return self.standard_error_response()
        serializer = ShiftSerializer(shift, data=request.data, partial=True)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data provided for update.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if serializer.is_valid():
            updated_shift = serializer.save()
            return standard_response(
                success=True,
                message="Shift details updated successfully.",
                data=ShiftSerializer(updated_shift).data,
                status_code=status.HTTP_200_OK
            )
        
        return standard_response(
            success=False,
            message="Failed to update shift details.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        shift = self.get_object(pk)

        if shift is None:
            return self.standard_error_response()
        shift.delete()
        return standard_response(
            success=True,
            message="Shift deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT
        )


class  AttendenceLogListCreateAPIView(APIView):
    """ Handles listing all attendance logs and creating new attendance logs."""

    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get(self, request):
        employee_id = request.query_params.get('employee_id')
        is_late = request.query_params.get('is_late')


        attendance_logs = AttendanceLog.objects.all().order_by('-created_at')
        if employee_id and employee_id.isdigit():
            attendance_logs = attendance_logs.filter(employee_id=employee_id)

        if is_late == 'true':
            attendance_logs = attendance_logs.filter(check_in__gt=F('shift__start_time'))
    
        serializer = AttendanceLogSerializer(attendance_logs, many=True)

        if not serializer.data:
            return standard_response(
                    success=False,
                    message="Error fetching the attendance logs",
                    status_code=status.HTTP_404_NOT_FOUND
                )
        return standard_response(
            success=True,
            message="Attendance logs retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    

    def post(self, request):
        serializer = AttendanceLogSerializer(data=request.data)
        if serializer.is_valid():
            attendance_log = serializer.save()
            return standard_response(
                success=True,
                message="Attendance log created successfully.",
                data=AttendanceLogSerializer(attendance_log).data,
                status_code=status.HTTP_201_CREATED
            )
        
        return standard_response(
            success=False,
            message="Failed to create attendance log.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
class AttendanceLogDetailAPIView(APIView):
    """ Handles retrieving, updating, and deleting a specific attendance log by its ID."""
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]

    def get_object(self, pk):
        try:
           return AttendanceLog.objects.get(pk=pk)
        except AttendanceLog.DoesNotExist:
            return None
        
    def standard_error_response(self, message="Attendance log not found.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )
    
    def get(self, request, pk):
        attendance_log = self.get_object(pk)
        if not attendance_log:
            return self.standard_error_response()
        serializer = AttendanceLogSerializer(attendance_log)

        return standard_response(
                success=True,
                message="Attendance log details retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
    
    def patch(self, request, pk):
        attendance_log = self.get_object(pk)

        if attendance_log is None:
            return self.standard_error_response() 
        serializer = AttendanceLogSerializer(attendance_log, data=request.data, partial=True)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data provided for update.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if serializer.is_valid():
            updated_attendance_log = serializer.save()
            return standard_response(
                success=True,
                message="Attendance log details updated successfully.",
                data=AttendanceLogSerializer(updated_attendance_log).data,
                status_code=status.HTTP_200_OK
            )
        
        return standard_response(
            success=False,
            message="Failed to update attendance log details.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        attendance_log = self.get_object(pk)

        if attendance_log is None:
            return self.standard_error_response()
        attendance_log.delete()
        return standard_response(
            success=True,
            message="Attendance log deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT
        )