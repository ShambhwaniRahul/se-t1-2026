from django.contrib import admin
from .models import (
    MenuItemStatusLog,
    CustomerLoyaltyLog,
    AttendanceLog
)


# Register your models here.
# ✅ Menu Item Status Log
@admin.register(MenuItemStatusLog)
class MenuItemStatusLogAdmin(admin.ModelAdmin):
    list_display = ('order_menu_item', 'status', 'created_at')
    search_fields = (
        'order_menu_item__order__customer__full_name',
        'order_menu_item__menu_item__name'
    )
    sortable_by = ('created_at',)


# ✅ Customer Loyalty Log
@admin.register(CustomerLoyaltyLog)
class CustomerLoyaltyLogAdmin(admin.ModelAdmin):
    list_display = ('payment', 'loyalty_points', 'usage_type', 'created_at')
    search_fields = ('payment__customer__full_name',)
    list_filter = ('usage_type',)
    sortable_by = ('created_at',)


# ✅ Attendance Log
@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ('shift', 'entry_time', 'exit_time', 'completed_work_hours')
    search_fields = (
        'shift__employee__first_name',
        'shift__employee__last_name'
    )
    sortable_by = ('entry_time', 'exit_time')

    def completed_work_hours(self, obj):
        return obj.completed_work_hours

    completed_work_hours.short_description = "Work Hours"
