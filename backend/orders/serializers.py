from rest_framework import serializers
from .models import MenuItem, MenuItemIngredient, DiningTable, Discounts, Order, OrderMenuItem
from django.utils.timezone import now
from datetime import timedelta


class MenuItemSerializer(serializers.ModelSerializer):

    discount = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'price',
            'estimated_prep_time',
            'discount',
            'is_veg',
            'category',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_discount(self, obj):
        discounts = obj.discounts_set.all().order_by('-created_at')

        for discount in discounts:
            # 🔥 VALIDITY CHECK
            if now() <= discount.created_at + timedelta(days=discount.validity):
                return discount.rate

        return 0.0





class MenuItemIngredientSerializer(serializers.ModelSerializer):
    # Readable fields
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    ingredient_name_display = serializers.CharField(
        source='ingredient_name.sku.name',
        read_only=True
    )

    # Computed property
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = MenuItemIngredient
        fields = [
            'id',
            'menu_item',                # write (ID)
            'menu_item_name',           # read
            'ingredient_name',          # write (ID)
            'ingredient_name_display',  # read
            'quantity_required',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class DiningTableSerializer(serializers.ModelSerializer):

    def validate_table_number(self, value):
        if value <= 0:
            raise serializers.ValidationError("Table number must be a positive integer.")
        return value
    
    def validate_total_seats(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total seats must be a positive integer.")
        return value
    
    
    class Meta:
        model = DiningTable
        fields = [
            'id',
            'table_number',
            'total_seats',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DiscountsSerializer(serializers.ModelSerializer):

    # 🔥 ADDED: menu item name for readability
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = Discounts
        fields = [
            'id',
            'menu_item',          # REQUIRED for linking
            'menu_item_name',     # ADDED for display
            'rate',
            'validity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    # 🔥 ADDED: validate discount rate (max 0.45)
    def validate_rate(self, value):
        if value > 0.45:
            raise serializers.ValidationError("Discount cannot exceed 45% (0.45).")
        if value < 0:
            raise serializers.ValidationError("Discount cannot be negative.")
        return value

    # 🔥 ADDED: validate validity (>= 1 day)
    def validate_validity(self, value):
        if value < 1:
            raise serializers.ValidationError("Validity must be at least 1 day.")
        return value
    

class OrderMenuItemSerializer(serializers.ModelSerializer):

    # 🔥 ADDED: readable fields
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    chef_name = serializers.CharField(source='chef.full_name', read_only=True)

    class Meta:
        model = OrderMenuItem
        fields = [
            'id',
            'order',
            'menu_item',
            'menu_item_name',   # 🔥 ADDED
            'chef',
            'chef_name',        # 🔥 ADDED
            'menu_item_status', # 🔥 IMPORTANT (tracking flow)
            'price_at_time',
            'special_instructions',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    # A validator for the price_at_time to ensure it's not negative:
    def validate_price_at_time(self, value):
        if value < 0:
            raise serializers.ValidationError("Price at time cannot be negative.")
        return value