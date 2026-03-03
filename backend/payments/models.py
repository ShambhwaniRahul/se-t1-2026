from django.db import models
from orders.models import Order

# Create your models here.
class CustomerPayment(models.Model):
    """
     A table for customer payments
    """
    class ModeChoices(models.IntegerChoices):
        CASH = 0, "Cash"
        UPI = 1, "Upi"
        CARD = 2, "Card"

    payment_mode = models.IntegerField(choices=ModeChoices.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'Customer Payment'
        verbose_name_plural = 'Customer Payments'
    
    def __str__(self):
        return f"Payment for order {self.order.id}"
    
    