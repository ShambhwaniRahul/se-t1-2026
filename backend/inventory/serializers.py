from rest_framework import serializers
from .models import PerishableSKU, PerishableInventory, NonPerishableInventory



class PerishableSKUSerializer(serializers.ModelSerializer):
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