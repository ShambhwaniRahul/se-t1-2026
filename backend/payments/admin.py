from django.contrib import admin
from .models import CustomerPayment

# Register your models here.
@admin.register(CustomerPayment)
class CustomerPaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_mode', 'timestamp', 'customer','order')
    search_fields = ('customer__name', 'order__table_number')
    sortable_by = ('timestamp')