from django.db import models
# from orders.models import Order

# Create your models here.
class Customer(models.Model):
    """
      Table to store the details of customers.
    """
    class GenderChoices(models.IntegerChoices):
        MALE = 0, "Male"
        FEMALE = 1, "Female"

    name = models.CharField(max_length=100)
    gender = models.IntegerField(GenderChoices.choices)
    email = models.EmailField(max_length=100, unique=True)
    phone_no = models.CharField(max_length=10, unique=True)


    @property
    def total_loyalty_points(self):
        return sum(log.loyalty_points for log in self.customerloyaltylog_set.all())

    class Meta:
        verbose_name  = "Customer"
        verbose_name_plural = "Customers"
    
    def __str__(self):
        return self.name