from rest_framework import serializers
from .models import PerishableSKU, PerishableInventory



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
    class Meta:
        model = PerishableInventory
        fields = [
            'id',
            'sku',
            'quantity',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id','sku','created_at','updated_at']