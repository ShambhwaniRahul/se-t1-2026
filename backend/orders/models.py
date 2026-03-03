from django.db import models
from inventory.models import PerishableInventory 
from customers.models import Customer
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.
# class ItemSize(models.Model):

#     class SizeChoices(models.IntegerChoices):
#         DEFAULT = 0, "Default"
#         SMALL = 1, "Small"
#         MEDIUM = 2, "Medium"
#         LARGE = 3, "Large"
#         X_LARGE = 4, "X-Large"

#     size = models.IntegerField(choices=SizeChoices.choices, unique=True)

#     @property
#     def multiplier(self):
#         mapping = {
#             self.SizeChoices.DEFAULT: 1.0,
#             self.SizeChoices.SMALL: 0.75,
#             self.SizeChoices.MEDIUM: 1.2,
#             self.SizeChoices.LARGE: 1.5,
#             self.SizeChoices.X_LARGE: 1.75,
#         }
#         return mapping.get(self.size, 1.0)

#     class Meta:
#         verbose_name = 'Item Size'
#         verbose_name_plural = 'Item Sizes'

#     def __str__(self):
#         return self.get_size_display()



class MenuItem(models.Model):
    """
    Table for Menu Items 
    """
    name = models.CharField(max_length=250)
    price = models.FloatField()
    # available_in_sizes = models.BooleanField(default=True)
    estimated_prep_time = models.IntegerField()
    discount = models.FloatField(default=0.0, validators=[MaxValueValidator(1.0), MinValueValidator(0.0)] )

    @property
    def discounted_price(self):
        return self.price*(1 - self.discount)

    class Meta:
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'

    def __str__(self):
        return f'{self.name} - {self.price}'
    

# class MenuItemSize(models.Model):
#     """
#     A lookup table
#     """    
#     menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE )
#     # size = models.ForeignKey(ItemSize, on_delete=models.CASCADE)

#     extra_charge = models.FloatField(default=0.0)
#     extra_prep_time = models.IntegerField(default=0)
    

#     class Meta:
#         unique_together = ('menu_item', 'size')

#     def __str__(self):
#         return f"{self.menu_item.name} - {self.size.get_size_display()}"
    

class MenuItemIngredient(models.Model):
    """
    Lookup table for Menu Items and ingredients.
    """    
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    ingredient_name = models.ForeignKey(PerishableInventory, on_delete=models.CASCADE)
    # item_size = models.ForeignKey(ItemSize, on_delete=models.CASCADE)
    quantity_required = models.FloatField(help_text="Quantity of the perishable item required for the Default size of the menu item")
    @property
    def is_available(self):
        return self.ingredient_name.quantity >= self.quantity_required
    
    class Meta:
        unique_together = ('menu_item', 'ingredient_name')

    def __str__(self):
        return f"{self.menu_item.name} - {self.ingredient_name.sku.name}"
    

class MenuItemOrderStatus(models.Model):
    """
    A lookup table for the order status of a particular order
    """
    class StatusChoices(models.IntegerChoices):
        PENDING = 0, "Pending"
        IN_PROGRESS = 1, "In Progress"
        READY_TO_SERVE = 2, "Ready to Serve"
        SERVED = 3, "Served"
        CANCELLED = 4, "Cancelled"
        REJECTED = 5, "Rejected"

    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    item_status = models.IntegerField(choices=StatusChoices.choices, default=StatusChoices.PENDING)

    class Meta:
        unique_together = ('menu_item', 'item_status')

    def __str__(self):
        return f"{self.menu_item.name} - {self.get_item_status_display()}"



class DiningTable(models.Model):
    """
    For the availability of tables
    """
    table_number = models.IntegerField(unique=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Dining Table'
        verbose_name_plural = 'Dining Tables'

    def __str__(self):
        return f'Table {self.table_number}'
    

   

class Order(models.Model):
    """
    Table for Orders
    """
    class StatusChoices(models.IntegerChoices):
        OPEN = 0, "Open"
        CLOSED = 1, "Closed"
        CANCELLED = 2, "Cancelled"

    class DiningTypeChoices(models.IntegerChoices):
        DINE_IN = 0 , "Dine In"
        TAKE_AWAY = 1, "Take Away"
        HOME_DELIVERY = 2, "Home Delivery"    

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    table = models.ForeignKey(DiningTable, on_delete=models.CASCADE)
    status = models.IntegerField(choices=StatusChoices.choices, default=StatusChoices.OPEN)
    dining_type = models.IntegerField(choices=DiningTypeChoices.choices)
    packaging_cost = models.IntegerField(default=0)


    @property
    def order_total(self):
        return sum(menu_item.item_total for menu_item in self.ordermenuitem_set.all()) + self.packaging_cost


    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f'Order {self.id}'
    


class OrderMenuItem(models.Model):
    """
    An association table for menu items in an order 
    """

    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)    
    

    @property
    def item_total(self):
        return self.menu_item.discounted_price *  self.quantity

    class Meta:
        unique_together = ('order', 'menu_item')


    def __str__(self):
        return f"{self.menu_item.name} - {self.quantity}"
    

