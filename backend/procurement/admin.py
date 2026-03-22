from django.contrib import admin
from .models import (
    Vendor,
    PurchaseOrder,
    PerishablePurchaseSKU,
    NonPerishablePurchaseSKU,
    VendorInvoice,
    VendorPurchaseLog
)

# ✅ Vendor
@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'contact_no', 'email', 'gst_no')
    search_fields = ('first_name', 'last_name', 'contact_no', 'email', 'gst_no')


# ✅ Purchase Order (🔥 Missing tha - important)
@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'purchase_type', 'purchase_date', 'status', 'delivery_cost')
    list_filter = ('purchase_type', 'status', 'purchase_date')
    search_fields = ('vendor__first_name', 'vendor__last_name', 'vendor__contact_no')
    date_hierarchy = 'purchase_date'


# ✅ Perishable Items
@admin.register(PerishablePurchaseSKU)
class PerishablePurchaseSKUAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__contact_no', 'sku__name')
    list_filter = ('purchase__purchase_type',)


# ✅ Non-Perishable Items
@admin.register(NonPerishablePurchaseSKU)
class NonPerishablePurchaseSKUAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__first_name', 'purchase__vendor__contact_no', 'sku__name')
    list_filter = ('purchase__purchase_type',)


# ✅ Vendor Invoice
@admin.register(VendorInvoice)
class VendorInvoiceAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'invoice_number', 'delivery_date')
    search_fields = ('invoice_number', 'purchase__vendor__first_name', 'purchase__vendor__contact_no')
    list_filter = ('delivery_date',)


# ✅ Vendor Purchase Log
@admin.register(VendorPurchaseLog)
class VendorPurchaseLogAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'transaction_id', 'created_at')
    search_fields = ('transaction_id', 'purchase__vendor__first_name', 'purchase__vendor__contact_no')
    list_filter = ('created_at',)
    sortable_by = ('created_at',)
