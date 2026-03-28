from rest_framework import serializers
from .models import PerishableSKU, PerishableInventory, NonPerishableInventory



class PerishableSKUSerializer(serializers.ModelSerializer):

    def validate_name(self, value):
        value = value.strip()

        queryset = PerishableSKU.objects.filter(name__iexact=value)

        # PATCH case handle
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                "A Perishable SKU with this name already exists."
            )

        return value
    
    def validate_typical_shelf_life(self, value):
        if value <= 0:
            raise serializers.ValidationError("Typical shelf life must be a positive integer.")
        return value
    
    
    class Meta:
        model = PerishableSKU
        fields = [
            'id',
            'name',
            'unit',
            'typical_shelf_life'
        ] 

        read_only_fields = ['id','created_at','updated_at']


class PerishableInventorySerializer(serializers.ModelSerializer):
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    sku_unit = serializers.CharField(source='sku.unit', read_only=True)
    expiry_date = serializers.SerializerMethodField()

    class Meta:
        model = PerishableInventory
        fields = [
            'id',
            'sku',          # for writing (ID)
            'sku_name',     # for read 
            'sku_unit',     # extra info
            'purchase_date',
            'expiry_date',
            'quantity',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id','expiry_date','created_at','updated_at']
        
    def get_expiry_date(self, obj):
        return obj.expiration_date    


class NonPerishableInventorySerializer(serializers.ModelSerializer):
    def validate_name(self, value):
        value = value.strip()

        queryset = NonPerishableInventory.objects.filter(name__iexact=value)

        # PATCH case handle
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                "A Non-Perishable Inventory item with this name already exists."
            )

        return value

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value


    class Meta:
        model = NonPerishableInventory
        fields = [
            'id',
            'name',
            'quantity',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id','created_at','updated_at']