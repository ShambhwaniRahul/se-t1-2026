from django.contrib import admin
from .models import (
    Vendor,
    PurchaseOrder,
    OrderedPerishablePurchaseSKU,
    OrderedNonPerishablePurchaseSKU,
    VendorInvoice,
    VendorPurchaseLog,
    DeliveredPerishableInventory,
    DeliveredNonPerishableInventory
)

# ✅ Vendor
@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'contact_no', 'email', 'gst_no')
    search_fields = ('first_name', 'last_name', 'contact_no', 'email', 'gst_no')


# ✅ Purchase Order
@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'purchase_type', 'purchase_date', 'status', 'delivery_cost')
    list_filter = ('purchase_type', 'status', 'purchase_date', 'vendor')
    search_fields = ('vendor__first_name', 'vendor__last_name', 'vendor__contact_no')
    date_hierarchy = 'purchase_date'


# ✅ Perishable Items
@admin.register(OrderedPerishablePurchaseSKU)
class OrderedPerishablePurchaseSKUAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__contact_no', 'sku__name')
    list_filter = ('purchase__vendor','sku')


# ✅ Non-Perishable Items
@admin.register(OrderedNonPerishablePurchaseSKU)
class OrderedNonPerishablePurchaseSKUAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'sku', 'quantity', 'unit_price')
    search_fields = ('purchase__vendor__first_name', 'purchase__vendor__contact_no', 'sku__name')
    list_filter = ('purchase__purchase_type','sku')


# ✅ Vendor Invoice
@admin.register(VendorInvoice)
class VendorInvoiceAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'invoice_number', 'delivery_date')
    search_fields = ('invoice_number', 'purchase__vendor__first_name', 'purchase__vendor__contact_no')
    list_filter = ('delivery_date',)


# ✅ Delivered Perishable Inventory
@admin.register(DeliveredPerishableInventory)
class DeliveredPerishableInventoryAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'created_at')
    search_fields = ('invoice__purchase__vendor__first_name', 'invoice__purchase__vendor__contact_no')
    list_filter = ('created_at',)


# ✅ Delivered Non-Perishable Inventory
@admin.register(DeliveredNonPerishableInventory)
class DeliveredNonPerishableInventoryAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'created_at')
    search_fields = ('invoice__purchase__vendor__first_name', 'invoice__purchase__vendor__contact_no')
    list_filter = ('created_at',)


# ✅ Vendor Purchase Log
@admin.register(VendorPurchaseLog)
class VendorPurchaseLogAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'transaction_id', 'created_at')
    search_fields = ('transaction_id', 'purchase__vendor__first_name', 'purchase__vendor__contact_no')
    list_filter = ('created_at',)
    sortable_by = ('created_at',)
