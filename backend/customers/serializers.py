from rest_framework import serializers
from .models import Customer, CustomerPayment, CustomerPointsBank
from django.db.models import Sum, Q
from orders.models import Order, OrderMenuItem
from django.utils import timezone
from datetime import datetime, timedelta

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

class CustomerSearchSerializer(serializers.Serializer):
    """
    Validates incoming search query parameters for customer search.
    """

    phone_no = serializers.CharField(required=False, max_length=20)
    first_name = serializers.CharField(required=False, max_length=50)
    last_name = serializers.CharField(required=False, max_length=50)
    
    class Meta:
        model = Customer
        fields = ['phone_no', 'first_name', 'last_name']

class CustomerReadSerializer(serializers.ModelSerializer):
    """
    Transforms Customer model instances into JSON payloads.
    """

    id = serializers.ReadOnlyField()
    total_points = serializers.SerializerMethodField()
    total_visits = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    last_visit = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "phone_no",
            "first_name",
            "last_name",
            "total_points",
            "total_visits",
            "total_spent",
            "last_visit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    
    def get_last_visit(self, obj):
        last_payment = CustomerPayment.objects.filter(customer=obj).order_by('-created_at').first()
        return last_payment.created_at if last_payment else datetime.now()

    def get_total_spent(self, obj):
        return CustomerPayment.objects.filter(customer=obj).aggregate(total=Sum('amt_paid'))['total'] or 0
     


    def get_total_visits(self, obj):
        return CustomerPayment.objects.filter(customer=obj).count() or 0

    def get_total_points(self, obj):
        # Calculate the date 30 days ago
        
        expiry_threshold = timezone.now() - timedelta(days=30)
        
        # Filter for points > 0 OR created within the last 30 days
        # total = CustomerPointsBank.objects.filter(
        #     Q(payment__customer=obj),
        #     Q(points__gt=0) & Q(created_at__gte=expiry_threshold)
        # ).aggregate(total=Sum('points'))['total']
        total = CustomerPointsBank.objects.filter(payment__customer=obj,payment__order__created_at__date__gte=expiry_threshold,created_at__gte=expiry_threshold).aggregate(total=Sum('points'))['total']
        
        return total or 0

class CustomerPaymentSerializer(serializers.ModelSerializer):

    # 🔥 Readable fields
    payment_mode_display = serializers.CharField(
        source="get_payment_mode_display", read_only=True
    )

    customer_name = serializers.CharField(
        source="customer.full_name", read_only=True
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
            "customer",
            "customer_name",
            "amt_paid",
            "discount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            # "amt_paid",
        ]

    def validate(self, attrs):
        """
        Optional: Add custom validations if needed
        """
        order = attrs.get("order")
        # order = Order.objects.filter(id=attrs.get("order")).first()
        
        if order and order.status == Order.StatusChoices.CLOSED:
            raise serializers.ValidationError("Order is already closed.")

        return attrs



class CustomerPaymentReadSerializer(serializers.ModelSerializer):
    payment_mode_display = serializers.CharField(
        source="get_payment_mode_display", read_only=True
    )

    customer_name = serializers.CharField(
        source="customer.full_name", read_only=True
    )

    order_id = serializers.IntegerField(
        source="order.id", read_only=True
    )

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

class CustomerOrdersSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="id", read_only=True)
    total_amount = serializers.FloatField(source="final_total", read_only=True)
    order_items = serializers.SerializerMethodField()


    class Meta:
        model = Order
        fields = ["order_id", "total_amount", "created_at", "order_items"]

    def get_order_items(self, obj):
        return [item.menu_item.name for item in obj.items.all()]




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


class PointsBankUserSerializer(serializers.ModelSerializer):
    customer_id = serializers.IntegerField(source="payment.customer.id", read_only=True)
    customer_name = serializers.CharField(source="payment.customer.full_name", read_only=True)
    order_id = serializers.IntegerField(source="payment.order.id", read_only=True)

    class Meta:
        model = CustomerPointsBank
        fields = [
            "id",
            "customer_id",
            "customer_name",
            "order_id",
            "points",
            "created_at"
        ]