from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(PerishablePaymentLog)
class PerishablePaymentLogAdmin(admin.ModelAdmin):
    list_display = ('purchase','transaction_id','created_at')
    search_fields = ('transaction_id','purchase__vendor__name')
    sortable_by = ('created_at',)

@admin.register(NonPerishablePaymentLog)
class NonPerishablePaymentLogAdmin(admin.ModelAdmin):
    list_display = ('purchase','transaction_id','created_at')
    search_fields = ('transaction_id','purchase__vendor__name')
    sortable_by = ('created_at',)


@admin.register(MenuItemStatusLog)
class MenuItemStatusLogAdmin(admin.ModelAdmin):
    list_display = ('order_menu_item','status','created_at')
    search_fields = ('order_menu_item__order__customer__name','order_menu_item__menu_item__name')
    sortable_by = ('created_at',)


@admin.register(CustomerLoyaltyLog)
class CustomerLoyaltyLogAdmin(admin.ModelAdmin):
    list_display = ('payment__customer','payment','loyalty_points','usage_type','created_at')
    search_fields = ('payment__customer__full_name',)
    sortable_by = ('created_at',)

@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ('shift__employee__first_name','shift__employee__last_name','entry_time','exit_time')
    search_fields = ('shift__employee__first_name','shift__employee__last_name')
    sortable_by = ('entry_time','exit_time')
    