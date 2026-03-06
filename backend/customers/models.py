from django.db import models
from core.models import TimeStampedModel
# from orders.models import Order

# Create your models here.
class Customer(TimeStampedModel):
    """
      Table to store the details of customers.
    """
    class GenderChoices(models.IntegerChoices):
        MALE = 0, "Male"
        FEMALE = 1, "Female"

    name = models.CharField(max_length=100, db_column="name")
    gender = models.IntegerField(choices=GenderChoices.choices, db_column="gender")
    email = models.EmailField(max_length=100, unique=True, db_column="email")
    phone_no = models.CharField(max_length=10, unique=True, db_column="phone_no")


    @property
    def total_loyalty_points(self):
        return sum(log.loyalty_points for log in self.customerloyaltylog_set.all())

    class Meta:
        verbose_name  = "Customer"
        verbose_name_plural = "Customers"
    
    def __str__(self):
        return self.name