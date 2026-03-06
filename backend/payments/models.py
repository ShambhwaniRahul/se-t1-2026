from django.db import models
from orders.models import Order
from core.models import TimeStampedModel

# Create your models here.
class CustomerPayment(TimeStampedModel):
    """
     A table for customer payments
    """
    class ModeChoices(models.IntegerChoices):
        CASH = 0, "Cash"
        UPI = 1, "Upi"
        CARD = 2, "Card"

    payment_mode = models.IntegerField(choices=ModeChoices.choices, db_column="payment_mode")
    timestamp = models.DateTimeField(auto_now_add=True, db_column="timestamp")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="order_id")

    class Meta:
        verbose_name = 'Customer Payment'
        verbose_name_plural = 'Customer Payments'
    
    def __str__(self):
        return f"Payment for order {self.order.id}"
    
    