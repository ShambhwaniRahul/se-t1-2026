from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(PerishablePaymentLog)
class PerishablePaymentLogAdmin(admin.ModelAdmin):
    list_display = ('purchase','transaction_id','timestamp')
    search_fields = ('transaction_id','purchase__vendor__name')
    sortable_by = ('timestamp',)

@admin.register(NonPerishablePaymentLog)
class NonPerishablePaymentLogAdmin(admin.ModelAdmin):
    list_display = ('purchase','transaction_id','timestamp')
    search_fields = ('transaction_id','purchase__vendor__name')
    sortable_by = ('timestamp',)


@admin.register(MenuItemStatusLog)
class MenuItemStatusLogAdmin(admin.ModelAdmin):
    list_display = ('order_menu_item','status','timestamp')
    search_fields = ('order_menu_item__order__customer__name','order_menu_item__menu_item__name')
    sortable_by = ('timestamp',)


@admin.register(CustomerLoyaltyLog)
class CustomerLoyaltyLogAdmin(admin.ModelAdmin):
    list_display = ('order__customer','order','loyalty_points','usage_type','timestamp')
    search_fields = ('order__customer__name',)
    sortable_by = ('timestamp',)