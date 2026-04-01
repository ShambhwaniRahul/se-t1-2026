from rest_framework import serializers
from .models import MenuItem, MenuItemIngredient, DiningTable


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'price',
            'estimated_prep_time',
            'discount',
            'created_at',
            'updated_at'
        ]

        read_only_fields = ['id', 'created_at', 'updated_at']


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
