from django.contrib import admin
from .models import *


# Register your models here.
@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('first_name','last_name', 'contact_no', 'email')
    search_fields = ('contact_no',)


@admin.register(PerishablePurchase)
class PerishablePurchaseAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'purchase_date', 'status', 'delivery_cost')
    list_filter = ('status',)
    search_fields = ('vendor__first_name','vendor__contact_no')


@admin.register(PerishablePurchaseSKU)
class PerishablePurchaseSKUAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__contact_no', 'sku__name')


@admin.register(NonPerishablePurchase)
class NonPerishablePurchaseAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'purchase_date', 'status', 'delivery_cost')
    list_filter = ('status',)
    search_fields = ('vendor__first_name','vendor__contact_no')


@admin.register(NonPerishablePurchaseItem)
class NonPerishablePurchaseItemAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__first_name','purchase__vendor__contact_no', 'sku__name')


@admin.register(PerishableVendorInvoice)
class PerishableVendorInvoiceAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'delivery_date')
    search_fields = ('purchase__vendor__first_name','purchase__vendor__contact_no')


@admin.register(NonPerishableVendorInvoice)
class NonPerishableVendorInvoiceAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'delivery_date')
    search_fields = ('purchase__vendor__first_name','purchase__vendor__contact_no')