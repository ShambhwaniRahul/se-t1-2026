from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'estimated_prep_time', 'discount')
    search_fields = ('name',)
    sortable_by = ('price', 'estimated_prep_time')

@admin.register(MenuItemIngredient)
class MenuItemIngredientAdmin(admin.ModelAdmin):
    list_display = ('menu_item', 'ingredient_name', 'quantity_required', 'is_available')
    search_fields = ('menu_item__name', 'ingredient_name__sku__name')


@admin.register(DiningTable)
class DiningTableAdmin(admin.ModelAdmin):
    list_display = ('table_number','total_seats' ,'is_available')
    search_fields = ('table_number',)
    list_filter = ('is_available','total_seats')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('table', 'status','dining_type','packaging_cost','order_total')
    search_fields = ('table__table_number',)
    list_filter = ('status', 'dining_type')
    sortable_by = ('order_total',)

@admin.register(OrderMenuItem)
class OrderMenuItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'menu_item', 'item_total','chef', 'menu_item_status','special_instructions')
    search_fields = ( 'order__table_number','menu_item__name')
    list_filter = ('order','menu_item_status')
    sortable_by = ('item_total',)