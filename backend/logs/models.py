from django.db import models
from orders.models import OrderMenuItem, MenuItemOrderStatus, Order
# from customers.models import Customer
from procurement.models import PerishablePurchase, NonPerishablePurchase
# Create your models here.

class PerishablePaymentLog(models.Model):
    """
    Log table to capture payment details for a perishable purchase
    """
    purchase = models.OneToOneField(PerishablePurchase, on_delete=models.CASCADE, db_column='purchase_id')
    transaction_id = models.CharField(db_column='transaction_id', max_length=100, unique=True)
    timestamp = models.DateTimeField(db_column='timestamp', auto_now_add=True)

    class Meta:
        verbose_name = 'Perishable Payment Log'
        verbose_name_plural = 'Perishable Payment Logs'
    
    def __str__(self):
        return f"Payment for {self.purchase.vendor.name} - {self.purchase.purchase_date}"
    

class NonPerishablePaymentLog(models.Model):
    """
    Log table to capture payment details for a non-perishable purchase
    """
    purchase = models.OneToOneField(NonPerishablePurchase, on_delete=models.CASCADE, db_column='purchase_id')
    transaction_id = models.CharField(db_column='transaction_id', max_length=100, unique=True)
    timestamp = models.DateTimeField(db_column='timestamp', auto_now_add=True)

    class Meta:
        verbose_name = 'Non-Perishable Payment Log'
        verbose_name_plural = 'Non-Perishable Payment Logs'
    
    def __str__(self):
        return f"Payment for {self.purchase.vendor.name} - {self.purchase.purchase_date}"



class MenuItemStatusLog(models.Model):
    """
    Log table for the status update of a menu item
    """
    order_menu_item  = models.ForeignKey(OrderMenuItem, on_delete=models.CASCADE)
    status = models.IntegerField(choices=MenuItemOrderStatus.StatusChoices.choices)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Menu Item Status Log"
        verbose_name_plural = "Menu Item Status Logs"

    def __str__(self):
        return f"{self.order_menu_item.menu_item.name} - {self.status}"




class CustomerLoyaltyLog(models.Model):
    """
    Logs to see the orders of the customer
    """
    class TypeChoices(models.IntegerChoices):
        USED = -1, "Used"
        EARNED = 1, "Earned"

    # customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    loyalty_points = models.IntegerField()
    usage_type = models.IntegerField(choices=TypeChoices.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    
    class Meta:
        verbose_name = "Customer Loyalty Log"
        verbose_name_plural = "Customer Loyalty Logs"
        unique_together = ('order', 'usage_type')

       

    def  __str__(self):
        return f"{self.customer.name} {self.usage_type} {self.loyalty_points} points for the order: {self.order}"