from django.contrib import admin
from .models import (Customer, CustomerPayment, CustomerPointsBank)

# Register your models here.
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone_no')
    search_fields = ('phone_no',)


@admin.register(CustomerPayment)
class CustomerPaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_mode', 'customer','order','amt_paid','discount')
    search_fields = ('customer__first_name', 'order__table_number')
    sortable_by = ('created_at',)
    list_filter = ('payment_mode','amt_paid')

@admin.register(CustomerPointsBank)
class CustomerPointsBankAdmin(admin.ModelAdmin):
    list_display = ("payment", "points", "created_at")
    search_fields = ("payment__customer__first_name", "payment__customer__last_name","points")
    sortable_by = ('created_at',)