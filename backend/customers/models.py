from django.db import models
from core.models import TimeStampedModel
from orders.models import Order

# Create your models here.
class Customer(TimeStampedModel):
    """
    Stores basic customer information and provides access to 
    derived attributes like full name and total loyalty points.
    """

    first_name = models.CharField(max_length=100, db_column="first_name")
    last_name = models.CharField(max_length=100, db_column="last_name")
    phone_no = models.CharField(max_length=10, unique=True, db_column="phone_no")
    
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
    Records payment transactions made by customers for orders,
    including the mode of payment used and earned loyalty points.  
    """
    class ModeChoices(models.IntegerChoices):
        CASH = 0, "Cash"
        UPI = 1, "Upi"
        CARD = 2, "Card"

    # class TypeChoices(models.IntegerChoices):
    #     INVALID = -1, "Invalid"
    #     VALID = 1, "Valid"    

    payment_mode = models.IntegerField(choices=ModeChoices.choices, db_column="payment_mode")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="order_id")
    # earned_loyalty_points = models.IntegerField(db_column="earned_loyalty_points")
    # usage_type = models.IntegerField(choices=TypeChoices.choices, db_column="usage_type")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column="customer_id")
    # Here, we'll add amt_paid = adjusted_amt. 
    # So, we can compute loyalty_points_used(will put it in the serializer) as order.final_total - customer_payment.adjusted_amt
    amt_paid = models.FloatField(db_column="amt_paid", null=False, blank=False)

    class Meta:
        verbose_name = 'Customer Payment'
        verbose_name_plural = 'Customer Payments'
    
    def __str__(self):
        return f"Payment for order {self.order.id} by {self.customer.full_name}"
  


class CustomerPointsBank(TimeStampedModel):
    """A table to store the loyalty points of a customer."""
    payment = models.ForeignKey(CustomerPayment, on_delete=models.CASCADE, db_column="payment_id")
    points = models.IntegerField(db_column="points")

    class Meta:
        verbose_name = 'Customer Points Bank'
        verbose_name_plural = 'Customer Points Banks'

    def __str__(self):
        return f"Points for payment {self.payment.id} by {self.payment.customer.full_name}"