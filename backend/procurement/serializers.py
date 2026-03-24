from rest_framework import serializers
from .models import Vendor, PurchaseOrder, PerishablePurchaseSKU, NonPerishablePurchaseSKU


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'first_name', 'last_name','address','contact_no', 'email', 'gst_no']
        read_only_fields = ['id']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.full_name', read_only=True)
    # total_cost = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'vendor',          # write (ID)
            'vendor_name',     # read (extra info)
            'purchase_type',
            'purchase_date',
            'status',
            'delivery_cost',
            'file_location',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'file_location',
            'created_at',
            'updated_at',
            # 'total_cost'
        ]


class PerishablePurchaseSKUSerializer(serializers.ModelSerializer):
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    sku_unit = serializers.CharField(source='sku.unit', read_only=True)
    purchase_id = serializers.IntegerField(source='purchase.id', read_only=True)

    class Meta:
        model = PerishablePurchaseSKU
        fields = [
            'id',
            'purchase',      # write (ID)
            'purchase_id',   # read
            'sku',           # write (ID)
            'sku_name',      # read
            'sku_unit',      # read
            'quantity',
            'unit_price',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'purchase_id',
            'sku_name',
            'sku_unit',
            'created_at',
            'updated_at'
        ]


class NonPerishablePurchaseSKUSerializer(serializers.ModelSerializer):
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    purchase_id = serializers.IntegerField(source='purchase.id', read_only=True)


    class Meta:
        model = NonPerishablePurchaseSKU
        fields = [
            'id',
            'purchase',      # write (ID)
            'purchase_id',   # read
            'sku',           # write (ID)
            'sku_name',      # read
            'quantity',
            'unit_price',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'purchase_id',
            'sku_name',
            'created_at',
            'updated_at'
        ]