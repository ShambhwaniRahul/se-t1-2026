from rest_framework import serializers
from .models import Employee, SalarySlip, SalarySlipBreakdown


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Transforms Employee model instances into JSON payloads and validates incoming data.
    Handles password hashing on create/update and exposes computed display fields.
    """
    full_name = serializers.CharField(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
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
            'role',
            'role_display',
            'monthly_salary',
            'joining_date',
            'leaving_date',
            'is_working',
            'is_staff',
            'password',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['joining_date', 'created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        employee = Employee(**validated_data)
        if password:
            employee.set_password(password)
        else:
            employee.set_unusable_password()
        employee.save()
        return employee

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# class SalarySlipBreakdownSerializer(serializers.ModelSerializer):
#     type_pay_display = serializers.CharField(source='get_type_pay_display', read_only=True)

#     class Meta:
#         model = SalarySlipBreakdown
#         fields = ['id', 'name', 'amount', 'type_pay', 'type_pay_display']


# class SalarySlipSerializer(serializers.ModelSerializer):
#     """
#     Serializes a SalarySlip along with its nested breakdown lines.
#     Breakdown items are read-only here; use SalarySlipBreakdownSerializer for writes.
#     """
#     employee_name = serializers.CharField(source='employee.full_name', read_only=True)
#     breakdowns = SalarySlipBreakdownSerializer(
#         source='salaryslipbreakdown_set', many=True, read_only=True
#     )

#     class Meta:
#         model = SalarySlip
#         fields = [
#             'id',
#             'employee',
#             'employee_name',
#             'date_paid',
#             'total_amount',
#             'transaction_no',
#             'breakdowns',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = ['date_paid', 'created_at', 'updated_at']

