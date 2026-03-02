from django.db import models
from datetime import date, timedelta

# Create your models here.
class PerishableSKU(models.Model):
    """
    Lookup table for a perishable inventory
    """
    class UnitChoices(models.TextChoices):
        KG = 'KG', 'KG'
        LITERS = 'L', 'Liters'
        PIECES = 'Pc', 'Pieces'
    name = models.CharField(db_column='sku_name', max_length=100, unique=True)
    unit = models.CharField(max_length=50, choices=UnitChoices.choices)
    typical_shelf_life = models.IntegerField(help_text="Typical shelf life in days")

    def __str__(self):
        return self.name
    

class PerishableInventory(models.Model):
    sku = models.ForeignKey(PerishableSKU, on_delete=models.CASCADE)
    quantity = models.FloatField()
    purchase_date = models.DateField()
    
    @property
    def expiration_date(self):
        return self.purchase_date + timedelta(days=self.sku.typical_shelf_life)
    
    def is_expired(self):
        return self.expiration_date < date.today()
    
    def __str__(self):
        return self.sku.name


class NonPerishableInventory(models.Model):
    name = models.CharField(db_column='sku_name', max_length=100, unique=True)
    quantity = models.IntegerField()

    def __str__(self):
        return self.name
