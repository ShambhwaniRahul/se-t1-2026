from django.contrib import admin
from .models import (Customer, CustomerPayment)

# Register your models here.
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone_no', 'total_loyalty_points')
    search_fields = ('phone_no',)


@admin.register(CustomerPayment)
class CustomerPaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_mode', 'customer','order')
    search_fields = ('customer__first_name', 'order__table_number')
    sortable_by = ('created_at',)