from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Employee, EmployeeRole, SalarySlip, SalarySlipBreakdown, Shifts
from logs.models import AttendanceLog
from .serializers import (
    EmployeeSerializer,EmployeeLoginSerializer,
    SalarySlipSerializer,
    SalarySlipBreakdownSerializer,
    ShiftSerializer, AttendanceLogSerializer,
    changeEmployeePasswordSerializer
)
from core.permissions import RequiresRole
from django.db.models import F
from django.utils.dateparse import parse_datetime
from utils.response import standard_response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


class EmployeeLoginView(APIView):
    """
    Authenticates an identity utilizing phone_no and password.
    Issues a JSON Web Token (JWT) pair for authorized sessions.
    """
    permission_classes = []
    authentication_classes = []

    @extend_schema(
        request=EmployeeLoginSerializer,
        responses=EmployeeLoginSerializer
    )

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

    @extend_schema(
        request=EmployeeSerializer,
        responses=EmployeeSerializer
    )

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        confirm_password = request.data.get('confirm_password')
        password = request.data.get('password')

        if not confirm_password or not password:
            return standard_response(
                success=False,
                message="Password and confirm password are required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if password != confirm_password:
            return standard_response(
                    success=False,
                    message="Password and confirm password do not match.",
                    status_code=status.HTTP_400_BAD_REQUEST
            ) 
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
            message=f"Failed to register employee due to the following reason: {serializer.errors}.",
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

    @extend_schema(
        responses=EmployeeSerializer(many=True)
    )

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

    @extend_schema(
        responses=EmployeeSerializer
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
    
    @extend_schema(
        request=EmployeeSerializer,
        responses=EmployeeSerializer
    )
    def patch(self, request, pk):  
        employee = self.get_object(pk)

        if request.data("password") is not None:
            return standard_response(
                success=False,
                message="Password cannot be updated from this endpoint.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

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
            status_code=status.HTTP_200_OK
        )
    
class ChangeEmployeePasswordView(APIView):
    """Endpoint to change the password of an employee."""
    permission_classes = [RequiresRole]
    required_roles = []

    @extend_schema(request=changeEmployeePasswordSerializer)
    def patch(self, request, pk):
        try:
           employee = Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return standard_response(
                success=False,
                message="No such employee exists.",
                status_code=status.HTTP_404_NOT_FOUND            
            )
        if employee.pk != request.user.pk and not EmployeeRole.objects.filter(employee=request.user,role__in=[EmployeeRole.RoleChoices.OWNER,EmployeeRole.RoleChoices.MANAGER]).exists():

            return standard_response(
                success=False,
                message="You cannot change the password of another employee.",
                status_code=status.HTTP_403_FORBIDDEN            
            )
        
        serializer = changeEmployeePasswordSerializer(data=request.data)
        if serializer.is_valid():
            # Check-1: For correct old_password
            if not request.user.check_password(serializer.validated_data['old_password']):
                return standard_response(
                    success=False,
                    message="Incorrect old password.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
 
            if serializer.validated_data['new_password'] != serializer.validated_data['confirm_password']:
                return standard_response(
                    success=False,
                    message="Passwords do not match.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            employee.set_password(serializer.validated_data['new_password'])
            employee.save()
            return standard_response(
                success=True,
                message="Password changed successfully.",
                status_code=status.HTTP_200_OK
            )
        return standard_response(
            success=False,
            message="Invalid data provided.",
            status_code=status.HTTP_400_BAD_REQUEST
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

    @extend_schema(responses=SalarySlipSerializer(many=True),
    parameters=[
        OpenApiParameter(
            name='min_date_paid',
            type=OpenApiTypes.DATE,
            description="Minimum date paid in the format YYYY-MM-DD",
            required=False
        ),
        OpenApiParameter(
            name='max_date_paid',
            type=OpenApiTypes.DATE,
            description="Maximum date paid in the format YYYY-MM-DD",
            required=False
        ),
        OpenApiParameter(
            name='transaction_no',
            type=OpenApiTypes.STR,
            description="Transaction number",
            required=False
        ),
        OpenApiParameter(
            name='min_amount',
            type=OpenApiTypes.FLOAT,
            description="Minimum amount",
            required=False
        ),
        OpenApiParameter(
            name='max_amount',
            type=OpenApiTypes.FLOAT,
            description="Maximum amount",
            required=False
        ),
    ]
)

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
    
    
    @extend_schema(
        request=SalarySlipSerializer,
        responses=SalarySlipSerializer
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
    

    @extend_schema(
        responses=SalarySlipSerializer
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
    
    @extend_schema(
        request=SalarySlipSerializer,
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
            status_code=status.HTTP_200_OK
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

    
    @extend_schema(responses=SalarySlipBreakdownSerializer,
                parameters=[
                    OpenApiParameter(
                        name="type",
                        type=OpenApiTypes.INT,
                        description="Type of the salary slip breakdown.  +1 : Increment, -1 : Deduction",
                        required=False
                    )
                ]
                   )
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

    @extend_schema(
        request=SalarySlipBreakdownSerializer,
        responses=SalarySlipBreakdownSerializer
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
    
    @extend_schema(
        request=SalarySlipBreakdownSerializer
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
            status_code=status.HTTP_200_OK
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


    @extend_schema(responses=ShiftSerializer(many=True),
            parameters=[
                OpenApiParameter(
                    name="start_time",
                    type=OpenApiTypes.DATETIME,
                    description="Start time of the shift in the format YYYY-MM-DD HH:MM:SS",
                    required=False
                ),
                OpenApiParameter(
                    name="end_time",
                    type=OpenApiTypes.DATETIME,
                    description="End time of the shift in the format YYYY-MM-DD HH:MM:SS",
                    required=False
                ),
                OpenApiParameter(
                    name="employee_id",
                    type=OpenApiTypes.INT,
                    description="ID of the employee",
                    required=False
                ),
            ])
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
            message="Shifts retrieved successfully." if serializer.data else "No shifts found for the given Parameters.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @extend_schema(
        request=ShiftSerializer,
        responses=ShiftSerializer
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
    
    @extend_schema(
        request=ShiftSerializer,
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
            status_code=status.HTTP_200_OK
        )


class  AttendenceLogListCreateAPIView(APIView):
    """ Handles listing all attendance logs and creating new attendance logs."""

    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER
    ]


    @extend_schema(
        responses=AttendanceLogSerializer(many=True),
        parameters=[
            OpenApiParameter(
            name="employee_id",
            type=OpenApiTypes.INT,
            description="ID of the employee",            
        ),
        OpenApiParameter(
            name="is_late",
            type=OpenApiTypes.STR,
            description="Filter for late attendance logs. Value should be 'true' or 'false'",
            )])
    def get(self, request):
        employee_id = request.query_params.get('employee_id')
        is_late = request.query_params.get('is_late')


        attendance_logs = AttendanceLog.objects.all().order_by('-created_at')
        if employee_id and employee_id.isdigit():
            attendance_logs = attendance_logs.filter(shift__employee_id=employee_id)

        if is_late == 'true':
            attendance_logs = attendance_logs.filter(check_in__gt=F('shift__start_time'))
    
        serializer = AttendanceLogSerializer(attendance_logs, many=True)

        return standard_response(
            success=True,
            message="Attendance logs retrieved successfully." if len(attendance_logs)>0 else "No attendance logs found for the given Parameters.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    

    @extend_schema(
        request=AttendanceLogSerializer,
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
    
    @extend_schema(
        request=AttendanceLogSerializer,
    )
    def patch(self, request, pk):
        attendance_log = self.get_object(pk)

        if attendance_log is None:
            return self.standard_error_response()
        if not request.data.get('exit_time'):
            return standard_response(
                success=False,
                message="Exit time is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            ) 
        serializer = AttendanceLogSerializer(attendance_log, data=request.data['exit_time'], partial=True)

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
            status_code=status.HTTP_200_OK
        )