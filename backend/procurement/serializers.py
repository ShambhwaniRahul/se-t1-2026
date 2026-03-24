from rest_framework import serializers
from .models import Vendor, PurchaseOrder, PerishablePurchaseSKU


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'first_name', 'last_name','address','contact_no', 'email', 'gst_no']
        read_only_fields = ['id']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.full_name', read_only=True)
    total_cost = serializers.SerializerMethodField()

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
            'total_cost'
        ]