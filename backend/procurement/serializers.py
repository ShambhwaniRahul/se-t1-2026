from rest_framework import serializers
from .models import (
    Vendor,
    PurchaseOrder,
    OrderedPerishablePurchaseSKU, OrderedNonPerishablePurchaseSKU,
    VendorInvoice,
    DeliveredPerishableInventory, DeliveredNonPerishableInventory
)

from datetime import date


class VendorSerializer(serializers.ModelSerializer):
    def validate_gst_no(self, value):
        if not value.startswith("GSTIN"):
            raise serializers.ValidationError('GST number must start with "GSTIN"')
    
        if len(value) != 15:
            raise serializers.ValidationError("GST number must be exactly 15 characters long.")
        
        if not value[5:].isdigit():
            raise serializers.ValidationError("GST number must be alphanumeric.")
        
        return value
        
    class Meta:
        model = Vendor
        fields = ['id', 'first_name', 'last_name','address','contact_no', 'email', 'gst_no']
        read_only_fields = ['id']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.full_name', read_only=True)

    # 🔥 ADD THESE
    items_total = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    def validate_purchase_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Purchase date cannot be in the future.")
        return value

    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'vendor',
            'vendor_name',
            'purchase_type',
            'purchase_date',
            'status',
            'delivery_cost',
            'file_location',
            'items_total',     # 🔥 added
            'grand_total',     # 🔥 added
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_items_total(self, obj):
        purchase_set = obj.purchase_set()
    
        return sum(
            item.quantity * item.unit_price
            for item in purchase_set
        )
    
    def get_grand_total(self, obj):
        return obj.delivery_cost + self.get_items_total(obj)


class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.full_name', read_only=True)
    vendor_email = serializers.CharField(source='vendor.email', read_only=True)
    vendor_phone = serializers.CharField(source='vendor.contact_no', read_only=True)

    items = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "vendor",
            "vendor_name",
            "vendor_email",
            "vendor_phone",
            "purchase_type",
            "purchase_date",
            "status",
            "delivery_cost",
            "items",
            "total_amount",
            "created_at",
            "updated_at",
        ]

    def get_items(self, obj):
        return obj.get_all_items()

    def get_total_amount(self, obj):
        return obj.total_cost()

    


class VendorInvoiceSerializer(serializers.ModelSerializer):
    # Readable fields (via purchase)
    vendor_name = serializers.CharField(
        source='purchase.vendor.full_name',
        read_only=True
    )
    purchase_date = serializers.DateField(
        source='purchase.purchase_date',
        read_only=True
    )

    def validate_invoice_number(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Invoice number cannot be empty.")
        return value

    class Meta:
        model = VendorInvoice
        fields = [
            'id',
            'purchase',        # write (ID)
            'invoice_number',
            'delivery_date',
            'invoice_file',
            'vendor_name',     # read (extra info)
            'purchase_date',   # read (extra info)
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]

class OrderedPerishablePurchaseSKUSerializer(serializers.ModelSerializer):
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    sku_unit = serializers.CharField(source='sku.unit', read_only=True)
    purchase_id = serializers.IntegerField(source='purchase.id', read_only=True)

    class Meta:
        model = OrderedPerishablePurchaseSKU
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


class OrderedNonPerishablePurchaseSKUSerializer(serializers.ModelSerializer):
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    purchase_id = serializers.IntegerField(source='purchase.id', read_only=True)


    class Meta:
        model = OrderedNonPerishablePurchaseSKU
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

class DeliveredPerishableInventorySerializer(serializers.ModelSerializer):
    invoice = serializers.PrimaryKeyRelatedField(
        queryset=VendorInvoice.objects.all()
    )

    class Meta:
        model = DeliveredPerishableInventory
        fields = [
            'id',
            'invoice',
            'delivered_json',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_delivered_json(self, value):
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError(
                "Delivered data must be a valid JSON object or list."
            )
        return value


class DeliveredNonPerishableInventorySerializer(serializers.ModelSerializer):
    invoice = serializers.PrimaryKeyRelatedField(
        queryset=VendorInvoice.objects.all()
    )

    class Meta:
        model = DeliveredNonPerishableInventory
        fields = [
            'id',
            'invoice',
            'delivered_json',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_delivered_json(self, value):
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError(
                "Delivered data must be a valid JSON object or list."
            )
        return value