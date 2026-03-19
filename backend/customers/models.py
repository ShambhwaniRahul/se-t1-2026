from django.db import models
from core.models import TimeStampedModel
from orders.models import Order

# Create your models here.
class Customer(TimeStampedModel):
    """
      Table to store the details of customers.
    """

    first_name = models.CharField(max_length=100, db_column="first_name")
    last_name = models.CharField(max_length=100, db_column="last_name")
    phone_no = models.CharField(max_length=10, unique=True, db_column="phone_no")

    @property
    def total_loyalty_points(self):
        return sum(log.loyalty_points for log in self.customerloyaltylog_set.all())
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        verbose_name  = "Customer"
        verbose_name_plural = "Customers"
    
    def __str__(self):
        return self.full_name
    

class CustomerPayment(TimeStampedModel):
    """
     A table for customer payments
    """
    class ModeChoices(models.IntegerChoices):
        CASH = 0, "Cash"
        UPI = 1, "Upi"
        CARD = 2, "Card"

    payment_mode = models.IntegerField(choices=ModeChoices.choices, db_column="payment_mode")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="order_id")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column="customer_id")

    class Meta:
        verbose_name = 'Customer Payment'
        verbose_name_plural = 'Customer Payments'
    
    def __str__(self):
        return f"Payment for order {self.order.id} by {self.customer.full_name}"        