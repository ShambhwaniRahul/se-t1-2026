from django.db import models
from inventory.models import PerishableInventory 
# from customers.models import Customer
from django.core.validators import MaxValueValidator, MinValueValidator
from core.models import TimeStampedModel
from humanresources.models import Employee

# Create your models here.

class MenuItem(TimeStampedModel):
    """
    Table for Menu Items.
    Has the details of the menu item like name, price, estimated preparation time, discount, etc.. 
    """
    class CategoryChoices(models.IntegerChoices):
        STARTER = 0, "Starter"
        MAIN_COURSE = 1, "Main Course"
        DESSERT = 2, "Dessert"
        BEVERAGE = 3, "Beverage"

    name = models.CharField(max_length=250, db_column="name")
    price = models.FloatField(db_column="price")
    # available_in_sizes = models.BooleanField(default=True)
    estimated_prep_time = models.IntegerField(db_column="estimated_prep_time")
    is_veg = models.BooleanField(default=True, db_column="is_veg")
    category = models.IntegerField(choices=CategoryChoices.choices, db_column="category", null=True)
    # discount = models.FloatField(default=0.0, validators=[MaxValueValidator(1.0), MinValueValidator(0.0)], db_column="discount")

        # 🔥 ADDED: discounted_price property using Discounts table
    @property
    def discounted_price(self):
        discount = self.discounts_set.order_by('-created_at').first()
        if discount:
            # 🔥 UPDATED: apply discount safely
            return self.price * (1 - discount.rate)
        return self.price


    class Meta:
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'

    def __str__(self):
        return f'{self.name} - {self.price}'


class Discounts(TimeStampedModel):
    """
    Table stores discount rate and a validity for a menu item
    """
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, db_column="menu_item_id")
    rate = models.FloatField(default=0.0, validators=[MaxValueValidator(1.0), MinValueValidator(0.0)], db_column="discount")
    validity = models.IntegerField(null=False, blank=False, db_column="validity", help_text="Enter validity period in days")

    class Meta:
        verbose_name = 'Discount'
        verbose_name_plural = 'Discounts'

    def __str__(self):
        return f"{self.menu_item.name} - {self.rate * 100}%"    

class MenuItemIngredient(TimeStampedModel):
    """
    Lookup table for Menu Items and its ingredients.
    We will use this lookup table for a few things.
    1. Availability of the menu item
    2. Any discount on the menu item based on the expiration date of the ingredient.
    """    
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, db_column="menu_item_id")
    ingredient_name = models.ForeignKey(PerishableInventory, on_delete=models.CASCADE, db_column="ingredient_name_id")
    quantity_required = models.FloatField(help_text="Quantity of the perishable item required for the Default size of the menu item", db_column="quantity_required")
    @property
    def is_available(self):
        return self.ingredient_name.quantity >= self.quantity_required
    
    class Meta:
        unique_together = ('menu_item', 'ingredient_name')

    def __str__(self):
        return f"{self.menu_item.name} - {self.ingredient_name.sku.name}"
    

class DiningTable(TimeStampedModel):
    """
    For the availability of tables
    To keep a check on the availability of tables and to assign tables to the customers.    
    """
    table_number = models.IntegerField(unique=True, db_column="table_number")
    total_seats = models.IntegerField(db_column="total_seats")
    is_available = models.BooleanField(default=True, db_column="is_available")

    class Meta:
        verbose_name = 'Dining Table'
        verbose_name_plural = 'Dining Tables'

    def __str__(self):
        return f'Table {self.table_number}'
    

   

class Order(TimeStampedModel):
    """
    Table for Orders.
    This table will have the details of the order like the table number, the status of the order in total, the type of dining, etc.. 
    """
    class StatusChoices(models.IntegerChoices):
        OPEN = 0, "Open"
        CLOSED = 1, "Closed"
        # CANCELLED = 2, "Cancelled"

    class DiningTypeChoices(models.IntegerChoices):
        DINE_IN = 0 , "Dine In"
        TAKE_AWAY = 1, "Take Away"
        # HOME_DELIVERY = 2, "Home Delivery"    

    # customer = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column="customer_id")
    table = models.ForeignKey(DiningTable, on_delete=models.CASCADE, db_column="table_id")
    status = models.IntegerField(choices=StatusChoices.choices, default=StatusChoices.OPEN, db_column="status")
    dining_type = models.IntegerField(choices=DiningTypeChoices.choices, default=DiningTypeChoices.DINE_IN, db_column="dining_type")
    packaging_cost = models.IntegerField(default=0, db_column="packaging_cost")
    # Newly Added: final_total to freeze bill amount
    final_total = models.FloatField(null=True, blank=True, db_column="final_total")    


    @property
    def order_total(self):
        """
        Computes the total cost of the order by summing up the total cost of each menu item in the order and adding the packaging cost if it's a take away order.
        """
        return sum(menu_item.item_total for menu_item in self.items.all()) + self.packaging_cost


    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f'Order {self.id}'
    


class OrderMenuItem(TimeStampedModel):
    """
    Not just an association table for menu items in an order.
    This table will make our Kitchen Display System more efficient by having the chef assigned to each menu item in the order and any special instructions for the chef regarding the preparation of the menu item.
    This table is also used to make a log of the status of each menu item in an order, which will be useful in computing the efficiency of the chefs and the waiters.     
    """

    class StatusChoices(models.IntegerChoices):
        PENDING = 0, "Pending"
        IN_PROGRESS = 1, "In Progress"
        READY_TO_SERVE = 2, "Ready to Serve"
        SERVED = 3, "Served"
        CANCELLED = 4, "Cancelled"
        REJECTED = 5, "Rejected"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="order_id", related_name="items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, db_column="menu_item_id")
    chef = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, db_column="chef_id")
    menu_item_status = models.IntegerField(choices=StatusChoices.choices, default=StatusChoices.PENDING, db_column="item_status")
    special_instructions = models.TextField(blank=True, null=True,db_column="special_instructions", help_text="Any special instructions for the chef regarding the preparation of this menu item.")
    # Newly Added: price_at_time to freeze price at order time
    price_at_time = models.FloatField(db_column="price_at_time")

    @property
    def item_total(self):
        return self.price_at_time
    
    @property
    def order_total(self):
        valid_items = self.items.exclude(
            menu_item_status__in=[
                OrderMenuItem.StatusChoices.CANCELLED,
                OrderMenuItem.StatusChoices.REJECTED
            ]
        )
    
        return sum(item.item_total for item in valid_items) + self.packaging_cost


    class Meta:
        verbose_name = 'Order Menu Item'
        verbose_name_plural = 'Order Menu Items'


    def __str__(self):
        return f"{self.menu_item.name} - {self.price_at_time}"
