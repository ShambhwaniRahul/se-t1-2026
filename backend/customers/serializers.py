from rest_framework import serializers
from .models import Customer, CustomerPayment, CustomerPointsBank
from django.db.models import Sum
from orders.models import Order

class CustomerSerializer(serializers.ModelSerializer):
    """
    Transforms Customer model instances into JSON payloads and validates incoming structural data.
    """

    id = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "phone_no",
            "first_name",
            "last_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        # read_only_fields = ['id']

class CustomerReadSerializer(serializers.ModelSerializer):
    """
    Transforms Customer model instances into JSON payloads.
    """

    id = serializers.ReadOnlyField()
    total_points = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "phone_no",
            "first_name",
            "last_name",
            "total_points",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_total_points(self, obj):
        return CustomerPointsBank.objects.filter(payment__customer=obj).aggregate(total=Sum('points'))['total'] or 0


class CustomerPaymentSerializer(serializers.ModelSerializer):

    # 🔥 Readable fields
    payment_mode_display = serializers.CharField(
        source="get_payment_mode_display", read_only=True
    )

    customer_name = serializers.CharField(
        source="customer.full_name", read_only=True
    )

    order_id = serializers.IntegerField(
        source="order.id", read_only=True
    )

    # 🔥 amt_paid should be read-only (calculated in backend)
    amt_paid = serializers.FloatField(read_only=True)

    class Meta:
        model = CustomerPayment
        fields = [
            "id",
            "payment_mode",
            "payment_mode_display",
            "order",
            "order_id",
            "customer",
            "customer_name",
            "amt_paid",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "amt_paid",
        ]

    def validate(self, attrs):
        """
        Optional: Add custom validations if needed
        """
        order = attrs.get("order")

        if order and order.status == Order.StatusChoices.CLOSED:
            raise serializers.ValidationError("Order is already closed.")

        return attrs



class CustomerPointsBankSerializer(serializers.ModelSerializer):
    payment_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomerPayment.objects.all(),
        source='payment'
    )
    customer_name = serializers.CharField(
        source='payment.customer.full_name',
        read_only=True
    )

    class Meta:
        model = CustomerPointsBank
        fields = ['id', 'payment_id', 'customer_name', 'points', 'created_at', 'updated_at']
        read_only_fields = ['id', 'customer_name', 'created_at', 'updated_at']

    def validate_points(self, value):
        if value < 0:
            raise serializers.ValidationError("Points cannot be negative.")
        return value
