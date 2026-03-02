from django.contrib import admin
from .models import PerishableSKU, PerishableInventory, NonPerishableInventory

# Register your models here.
@admin.register(PerishableSKU)
class PerishableSKUAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit', 'typical_shelf_life')
    search_fields = ('name',)


@admin.register(PerishableInventory)
class PerishableInventoryAdmin(admin.ModelAdmin):
    list_display = ('sku', 'quantity', 'sku__unit', 'purchase_date', 'expiration_date', 'is_expired')
    search_fields = ('sku__name',)


@admin.register(NonPerishableInventory)
class NonPerishableInventoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'quantity')
    search_fields = ('name',)
