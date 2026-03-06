from django.db import models
from datetime import date, timedelta
from core.models import TimeStampedModel

# Create your models here.
class PerishableSKU(TimeStampedModel):
    """
    Lookup table for a perishable inventory
    """
    class UnitChoices(models.TextChoices):
        KG = 'KG', 'KG'
        LITERS = 'L', 'Liters'
        PIECES = 'Pc', 'Pieces'
    name = models.CharField(db_column='sku_name', max_length=100, unique=True)
    unit = models.CharField(db_column='unit', max_length=50, choices=UnitChoices.choices)
    typical_shelf_life = models.IntegerField(db_column='typical_shelf_life', help_text="Typical shelf life in days")

    class Meta:
        verbose_name = 'Perishable SKU'
        verbose_name_plural = 'Perishable SKUs'

    def __str__(self):
        return self.name
    

class PerishableInventory(TimeStampedModel):
    """
    Table to track individual batches of perishable inventory, including quantity and purchase date.
    """
    sku = models.ForeignKey(PerishableSKU, on_delete=models.CASCADE, db_column='sku_id')
    quantity = models.FloatField(db_column='quantity')
    purchase_date = models.DateField(db_column='purchase_date')
    class Meta:
        verbose_name = 'Perishable Inventory'
        verbose_name_plural = 'Perishable Inventories'

    @property
    def expiration_date(self):
        return self.purchase_date + timedelta(days=self.sku.typical_shelf_life)
    
    def is_expired(self):
        return self.expiration_date < date.today()
    
    def __str__(self):
        return self.sku.name

class NonPerishableInventory(TimeStampedModel):
    """
    Table to track non-perishable inventory items and their available quantities.
    """
    name = models.CharField(db_column='sku_name', max_length=100, unique=True)
    quantity = models.IntegerField(db_column='quantity')

    class Meta:
        verbose_name = 'Non-Perishable Inventory'
        verbose_name_plural = 'Non-Perishable Inventories'

    def __str__(self):
        return self.name
