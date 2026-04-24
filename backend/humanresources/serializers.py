from rest_framework import serializers
from .models import Employee, EmployeeRole, SalarySlip, SalarySlipBreakdown, Shifts
from logs.models import AttendanceLog


class EmployeeRoleSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = EmployeeRole
        fields = ['role', 'role_display'] # Passing just the role_display from here
        # fields = ['id', 'role', 'role_display']


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    id = serializers.ReadOnlyField()
    roles = EmployeeRoleSerializer(source='employeerole_set', many=True, read_only=True)

    # 🔥 Changed here from ListField to support both read + write
    role_ids = serializers.ListField(   # Changed here from SerializerMethodField to ListField
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        write_only=True                 # add this (so input ke liye use ho)
    )

    # 🔥 Added this for output
    # role_ids_display = serializers.SerializerMethodField()   # add this

    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'gender',
            'gender_display',
            'email',
            'phone_no',
            'monthly_salary',
            'joining_date',
            'leaving_date',
            'is_working',
            'is_staff',

            'roles',
            'role_ids',          # write-only
            # 'role_ids_display',  # add this (read-only)

            'password',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'joining_date', 'created_at', 'updated_at']

    def validate_role_ids(self, value):
        valid_role_values = {choice.value for choice in EmployeeRole.RoleChoices}
        invalid_roles = [role for role in value if role not in valid_role_values]

        if invalid_roles:
            raise serializers.ValidationError(
                f"Invalid role id(s): {invalid_roles}. Allowed values are {sorted(valid_role_values)}."
            )

        return list(dict.fromkeys(value))

    def create(self, validated_data):
        role_ids = validated_data.pop('role_ids', [])
        password = validated_data.pop('password', None)

        employee = Employee(**validated_data)

        if password:
            employee.set_password(password)
        else:
            employee.set_unusable_password()

        employee.save()

        for role in role_ids:
            EmployeeRole.objects.create(employee=employee, role=role)

        return employee

    def update(self, instance, validated_data):
        role_ids = validated_data.pop('role_ids', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if role_ids is not None:
            instance.employeerole_set.all().delete()
            for role in role_ids:
                EmployeeRole.objects.create(employee=instance, role=role)

        return instance

    # # 🔥 Added this method for output
    # def get_role_ids_display(self, obj):   # add this
    #     return list(
    #         obj.employeerole_set.values_list('role', flat=True)
    # )

    

class EmployeeLoginSerializer(serializers.Serializer):
    phone_no = serializers.CharField()
    password = serializers.CharField()

    class Meta:
        model = Employee
        fields = ['phone_no', 'password']    

class SalarySlipBreakdownSerializer(serializers.ModelSerializer):
    type_pay_display = serializers.CharField(source='get_type_pay_display', read_only=True)
    salary_slip = serializers.PrimaryKeyRelatedField(queryset=SalarySlip.objects.all())

    class Meta:
        model = SalarySlipBreakdown
        fields = ['id', 'salary_slip', 'name', 'amount', 'type_pay', 'type_pay_display']

    def validate(self, data):
        salary_slip = data.get('salary_slip')
        name = data.get('name')

        # Handle update case (exclude self)
        qs = SalarySlipBreakdown.objects.filter(
            salary_slip=salary_slip,
            name=name
        )
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "This salary component already exists for this salary slip."
            )

        return data

class changeEmployeePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})   

    
class SalarySlipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = SalarySlip
        # '__all__' automatically grabs all the new fields we just made (month, net_pay, etc.)
        fields = '__all__'


    def validate_salary_slip(self, value):
        employee = value.employee
        month = value.month

        if SalarySlip.objects.filter(employee=employee, month=month).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("A salary slip for this employee and month already exists.")
        return value    



class ShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    work_hours = serializers.DurationField(read_only=True)

    class Meta:
        model = Shifts
        fields = [
            'id',
            'employee',
            'employee_name',
            'start_time',
            'end_time',
            'work_hours',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class AttendanceLogSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='shift.employee.full_name', read_only=True)

    entry_delay = serializers.DurationField(read_only=True)
    early_exit = serializers.DurationField(read_only=True)
    completed_work_hours = serializers.DurationField(read_only=True)

    def validate(self, data):
         entry = data.get('entry_time')
         exit = data.get('exit_time')
     
         if entry and exit and exit < entry:
             raise serializers.ValidationError("Exit time cannot be before entry time.")
     
         return data


    class Meta:
        model = AttendanceLog
        fields = [
            'id',
            'shift',
            'employee_name',
            'entry_time',
            'exit_time',
            'entry_delay',
            'early_exit',
            'completed_work_hours',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
