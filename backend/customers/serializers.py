from rest_framework import serializers
from .models import Customer, CustomerPayment


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


class CustomerPaymentSerializer(serializers.ModelSerializer):

    # 🔥 Readable fields
    payment_mode_display = serializers.CharField(
        source="get_payment_mode_display", read_only=True
    )

    usage_type_display = serializers.CharField(
        source="get_usage_type_display", read_only=True
    )

    customer_name = serializers.CharField(source="customer.full_name", read_only=True)

    order_id = serializers.IntegerField(source="order.id", read_only=True)

    # 🔥 Make loyalty points read-only
    earned_loyalty_points = serializers.IntegerField(read_only=True)

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
            "earned_loyalty_points",  # 🔥 now auto-calculated
            "usage_type",
            "usage_type_display",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "earned_loyalty_points"]

    # 🔥 AUTO CALCULATION
    def create(self, validated_data):
        order = validated_data.get("order")

        # 🔥 Calculate loyalty points (6% of final_total)
        final_total = order.final_total or 0
        loyalty_points = int(final_total * 0.06)

        validated_data["earned_loyalty_points"] = loyalty_points

        return super().create(validated_data)
