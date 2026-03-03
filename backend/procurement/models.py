from django.db import models
from django.core.validators import RegexValidator
from inventory.models import PerishableSKU, NonPerishableInventory

# Create your models here.
class Vendor(models.Model):
    """
    Lookup table for vendors
    """
    name = models.CharField(db_column='vendor_name', max_length=200)
    address = models.TextField(db_column='vendor_address')
    contact_no = models.CharField(db_column='vendor_contact_no', max_length=10, unique=True)
    email = models.EmailField(db_column='vendor_email', max_length=100, unique=True)
    gst_no = models.CharField(
            db_column='vendor_gst_no', 
            max_length=50,
            validators=[
                RegexValidator(
                    regex=r'^GSTIN',
                    message='GST number must start with "GSTIN"'
                )
            ],
            unique=True
        )
    
    class Meta:
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'
    
    def __str__(self):
        return self.name


class PerishablePurchase(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        RECEIVED = 'Received', 'Received'
        CANCELLED = 'Cancelled', 'Cancelled'
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, db_column='vendor_id')
    purchase_date = models.DateField(db_column='purchase_date')
    status = models.CharField(db_column='status', max_length=50, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    delivery_cost = models.FloatField(db_column='delivery_cost', default=0.0)
    file_location = models.FileField(db_column='file_location', upload_to='static/procurement_files/', null=True, blank=True)

    class Meta:
        verbose_name = 'Perishable Purchase'
        verbose_name_plural = 'Perishable Purchases'
    
    def __str__(self):
        return f"{self.vendor.name} - {self.purchase_date}"
    
    def total_cost(self):
        total = self.delivery_cost
        for item in self.perishablepurchasesku_set.all():
            total += item.quantity * item.unit_price
        return total


class NonPerishablePurchase(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        RECEIVED = 'Received', 'Received'
        CANCELLED = 'Cancelled', 'Cancelled'
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, db_column='vendor_id')
    purchase_date = models.DateField(db_column='purchase_date')
    status = models.CharField(db_column='status', max_length=50, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    delivery_cost = models.FloatField(db_column='delivery_cost', default=0.0)
    file_location = models.FileField(db_column='file_location', upload_to='static/procurement_files/', null=True, blank=True)

    class Meta:
        verbose_name = 'Non-Perishable Purchase'
        verbose_name_plural = 'Non-Perishable Purchases'
    
    def __str__(self):
        return f"{self.vendor.name} - {self.purchase_date}"
    
    def total_cost(self):
        total = self.delivery_cost
        for item in self.nonperishablepurchaseitem_set.all():
            total += item.quantity * item.unit_price
        return total


class PerishablePurchaseSKU(models.Model):
    """
    Association table between PerishablePurchase and PerishableSKU to capture quantity and unit price of each SKU in a purchase
    """
    purchase = models.ForeignKey(PerishablePurchase, on_delete=models.CASCADE, db_column='purchase_id')
    sku = models.ForeignKey(PerishableSKU, on_delete=models.CASCADE, db_column='sku_id')
    quantity = models.FloatField(db_column='quantity')
    unit_price = models.FloatField(db_column='unit_price')

    class Meta:
        verbose_name = 'Perishable Purchase SKU'
        verbose_name_plural = 'Perishable Purchase SKUs'
    
    def __str__(self):
        return f"{self.purchase.vendor.name} - {self.sku.name} - {self.quantity} {self.sku.unit}"
    

class NonPerishablePurchaseItem(models.Model):
    """
    Association table for non-perishable items in a purchase since we don't have a SKU table for non-perishables
    """
    purchase = models.ForeignKey(NonPerishablePurchase, on_delete=models.CASCADE, db_column='purchase_id')
    sku = models.ForeignKey(NonPerishableInventory, on_delete=models.CASCADE, db_column='sku_id')
    quantity = models.IntegerField(db_column='quantity')
    unit_price = models.FloatField(db_column='unit_price')

    class Meta:
        verbose_name = 'Non-Perishable Purchase Item'
        verbose_name_plural = 'Non-Perishable Purchase Items'
    
    def __str__(self):
        return f"{self.purchase.vendor.name} - {self.sku.name} - {self.quantity}"
    

class PerishableVendorInvoice(models.Model):
    """
    Association table to capture invoice details for a perishable purchase
    """
    purchase = models.OneToOneField(PerishablePurchase, on_delete=models.CASCADE, db_column='purchase_id')
    delivery_date = models.DateField(db_column='delivery_date')
    file_location = models.FileField(db_column='file_location', upload_to='static/procurement_invoices/', null=True, blank=True)

    class Meta:
        verbose_name = 'Perishable Vendor Invoice'
        verbose_name_plural = 'Perishable Vendor Invoices'
    
    def __str__(self):
        return f"Invoice for {self.purchase.vendor.name} - {self.purchase.purchase_date}"
    

class NonPerishableVendorInvoice(models.Model):
    """
    Association table to capture invoice details for a non-perishable purchase
    """
    purchase = models.OneToOneField(NonPerishablePurchase, on_delete=models.CASCADE, db_column='purchase_id')
    delivery_date = models.DateField(db_column='delivery_date')
    file_location = models.FileField(db_column='file_location', upload_to='static/procurement_invoices/', null=True, blank=True)

    class Meta:
        verbose_name = 'Non-Perishable Vendor Invoice'
        verbose_name_plural = 'Non-Perishable Vendor Invoices'
    
    def __str__(self):
        return f"Invoice for {self.purchase.vendor.name} - {self.purchase.purchase_date}"   

