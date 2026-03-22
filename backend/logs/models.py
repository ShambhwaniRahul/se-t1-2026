from django.db import models
from orders.models import OrderMenuItem #, Order
# from customers.models import Customer
from core.models import TimeStampedModel
from customers.models import CustomerPayment
from humanresources.models import Employee, Shifts
from datetime import datetime, timedelta


# Create your models here.
class MenuItemStatusLog(TimeStampedModel):
    """
    Log table for the status update of a menu item.
    This table will store the update of the status of a menu item in an order. 
    This will be useful in computing the efficiency of the chef and the waiter, based on different parameters like, day of the week, holiday, etc.. 
    """
    order_menu_item  = models.ForeignKey(OrderMenuItem, on_delete=models.CASCADE, db_column="order_menu_item_id")
    status = models.IntegerField(choices=OrderMenuItem.StatusChoices.choices, db_column="status")

    class Meta:
        verbose_name = "Menu Item Status Log"
        verbose_name_plural = "Menu Item Status Logs"

    def __str__(self):
        return f"{self.order_menu_item.menu_item.name} - {self.status}"




class AttendanceLog(TimeStampedModel):
    """
    Logs to store the attendance of the employee.
    Again, for keeping check on the efficiency of the employees.
    """
    shift = models.ForeignKey(Shifts, on_delete=models.CASCADE, db_column="shift_id")
    entry_time = models.DateTimeField(db_column="entry_time")
    exit_time = models.DateTimeField(db_column="exit_time")
    

    @property
    def entry_delay(self):
        """Delay in entering after shift start"""
        shift_start = datetime.combine(self.entry_time.date(), self.shift.start_time)

        delay = self.entry_time - shift_start
        return delay if delay > timedelta(0) else timedelta(0)
    
    @property
    def early_exit(self):
        """Leaving before shift end"""
        shift_end = datetime.combine(self.entry_time.date(), self.shift.end_time)

        # Handle overnight shift
        if self.shift.end_time < self.shift.start_time:
            shift_end += timedelta(days=1)

        early = shift_end - self.exit_time
        return early if early > timedelta(0) else timedelta(0)
    
    @property
    def completed_work_hours(self):
        """Actual worked duration"""
        return self.exit_time - self.entry_time

    """ We'll be adding more props"""

    class Meta:
        verbose_name = "Attendance Log"
        verbose_name_plural = "Attendance Logs"

    def __str__(self):
        return f"{self.shift.employee.full_name} worked for {self.completed_work_hours} hours today!"