from django.db import models
from orders.models import OrderMenuItem, MenuItemOrderStatus #, Order
# from customers.models import Customer
from core.models import TimeStampedModel
from customers.models import CustomerPayment
from humanresources.models import Employee, Shifts

# Create your models here.
class MenuItemStatusLog(TimeStampedModel):
    """
    Log table for the status update of a menu item
    """
    order_menu_item  = models.ForeignKey(OrderMenuItem, on_delete=models.CASCADE, db_column="order_menu_item_id")
    status = models.IntegerField(choices=MenuItemOrderStatus.StatusChoices.choices, db_column="status")
    # timestamp = models.DateTimeField(auto_now_add=True, db_column="timestamp")

    class Meta:
        verbose_name = "Menu Item Status Log"
        verbose_name_plural = "Menu Item Status Logs"

    def __str__(self):
        return f"{self.order_menu_item.menu_item.name} - {self.status}"




class CustomerLoyaltyLog(TimeStampedModel):
    """
    Logs to see the orders of the customer
    """
    class TypeChoices(models.IntegerChoices):
        USED = -1, "Used"
        EARNED = 1, "Earned"

    # customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    # order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="order_id")
    payment = models.ForeignKey(CustomerPayment, on_delete=models.CASCADE, db_column="payment_id")
    loyalty_points = models.IntegerField(db_column="loyalty_points")
    usage_type = models.IntegerField(choices=TypeChoices.choices, db_column="usage_type")
    # timestamp = models.DateTimeField(auto_now_add=True, db_column="timestamp")
    
    
    class Meta:
        verbose_name = "Customer Loyalty Log"
        verbose_name_plural = "Customer Loyalty Logs"
        unique_together = ('payment', 'usage_type')

       

    def  __str__(self):
        return f"{self.payment.customer.full_name} {self.usage_type} {self.loyalty_points} points for the order: {self.payment.order.id}"
    

class AttendanceLog(TimeStampedModel):
    """
    Logs to store the attendance of the employee
    """
    shift = models.ForeignKey(Shifts, on_delete=models.CASCADE, db_column="shift_id")
    entry_time = models.DateTimeField(db_column="entry_time")
    exit_time = models.DateTimeField(db_column="exit_time")
    

    @property
    def entry_delay(self):
        """ Under the scanner"""
        return max(self.entry_time - self.shift.start_time,0)
    
    @property
    def early_exit(self):
        """ Under the scanner"""
        return max(self.shift.end_time - self.exit_time,0)
    
    @property
    def completed_work_hours(self):
        """ Under the scanner"""
        return self.exit_time - self.entry_time

    """ We'll be adding more props"""

    class Meta:
        verbose_name = "Attendance Log"
        verbose_name_plural = "Attendance Logs"

    def __str__(self):
        return f"{self.shift.employee.full_name} worked for {self.completed_work_hours} hours today!"