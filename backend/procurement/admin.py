from django.contrib import admin
from .models import (
    Vendor,
    VendorPurchase,
    PerishablePurchaseSKU,
    NonPerishablePurchaseItem,
    VendorInvoice,
    VendorPurchaseLog
)

# Register your models here.

# ✅ Vendor
@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'contact_no', 'email')
    search_fields = ('first_name', 'last_name', 'contact_no')


# ✅ Vendor Purchase (merged)
@admin.register(VendorPurchase)
class VendorPurchaseAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'purchase_type', 'purchase_date', 'status', 'delivery_cost')
    list_filter = ('status', 'purchase_type')
    search_fields = ('vendor__first_name', 'vendor__contact_no')


# ✅ Perishable Items
@admin.register(PerishablePurchaseSKU)
class PerishablePurchaseSKUAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__contact_no', 'sku__name')


# ✅ Non-Perishable Items
@admin.register(NonPerishablePurchaseItem)
class NonPerishablePurchaseItemAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__first_name', 'purchase__vendor__contact_no', 'sku__name')


# ✅ Vendor Invoice (merged)
@admin.register(VendorInvoice)
class VendorInvoiceAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'delivery_date')
    search_fields = ('purchase__vendor__first_name', 'purchase__vendor__contact_no')

# ✅ Vendor Purchase Log (merged)
@admin.register(VendorPurchaseLog)
class VendorPurchaseLogAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'transaction_id', 'created_at')
    search_fields = ('transaction_id', 'purchase__vendor__first_name', 'purchase__vendor__contact_no')
    sortable_by = ('created_at',)
