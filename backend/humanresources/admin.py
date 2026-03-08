from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['first_name','last_name','gender', 'email', 'phone_no', 'role', 'monthly_salary', 'joining_date', 'is_working', 'leaving_date']
    search_fields = ['first_name', 'email', 'phone_no']
    list_filter = ['gender', 'role', 'is_working']
    # sortable_by = ['monthly_salary', 'joining_date', 'leaving_date']

@admin.register(SalarySlip)
class SalarySlipAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date_paid', 'total_amount', 'transaction_no']
    search_fields = ['employee__name', 'transaction_no']
    list_filter = ['date_paid',]
    # sortable_by = ['total_amount', 'date_paid']

@admin.register(SalarySlipBreakdown)
class SalarySlipBreakdownAdmin(admin.ModelAdmin):
    list_display = ['salary_slip','name', 'type_pay', 'amount']
    search_fields = ['salary_slip__employee__name', 'name','type_pay']
    list_filter = ['type_pay',]

@admin.register(Shifts)
class ShiftsAdmin(admin.ModelAdmin):
    list_display = ['employee', 'start_time', 'end_time']
    search_fields = ['employee__phone_no','employee__email']
    list_filter = ['start_time', 'end_time']