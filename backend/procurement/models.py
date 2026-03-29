from django.db import models
from django.core.validators import RegexValidator
from inventory.models import PerishableSKU, NonPerishableInventory
from core.models import TimeStampedModel
import uuid

# Create your models here.
class Vendor(TimeStampedModel):
    """
    Lookup table for vendors
    """
    first_name = models.CharField(db_column='first_name', max_length=100)
    last_name = models.CharField(db_column='last_name', max_length=200)
    address = models.TextField(db_column='vendor_address')
    contact_no = models.CharField(db_column='vendor_contact_no', max_length=10, unique=True)
    email = models.EmailField(db_column='vendor_email', max_length=100, unique=True)
    gst_no = models.CharField(
            db_column='vendor_gst_no', 
            max_length=15,
            validators=[
                RegexValidator(
                    regex=r'^GSTIN',
                    message='GST number must start with "GSTIN"'
                )
            ],
            unique=True
        )
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    class Meta:
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'
    
    def __str__(self):
        return self.full_name
    

class PurchaseOrder(TimeStampedModel):
    """
    A table to store Vendor purchases.
    """

    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        RECEIVED = 'Received', 'Received'
        CANCELLED = 'Cancelled', 'Cancelled'

    class TypeChoices(models.TextChoices):
        PERISHABLE = 'Perishable', 'Perishable'
        NON_PERISHABLE = 'Non-Perishable', 'Non-Perishable'

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        db_column='vendor_id'
    )

    purchase_type = models.CharField(
        max_length=50,
        choices=TypeChoices.choices,
        db_column='purchase_type'
    )

    purchase_date = models.DateField(db_column='purchase_date')

    status = models.CharField(
        db_column='status',
        max_length=50,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )

    delivery_cost = models.FloatField(
        db_column='delivery_cost',
        default=0.0
    )
           
    file_location = models.FileField(
        db_column='file_location',
        upload_to='static/procurement_files/',
        default=f"{'static/procurement_files/' + str(uuid.uuid4()) + '.pdf'}"
    )

    class Meta:
        verbose_name = 'Vendor Purchase'
        verbose_name_plural = 'Vendor Purchases'

    def __str__(self):
        return f"{self.vendor.full_name} - {self.purchase_date}"

    def total_cost(self):
        """
        Calculate total cost of the purchase by summing up the cost of each item
        """

        purchase_set = (
            self.perishablepurchasesku_set.all()
            if self.purchase_type == self.TypeChoices.PERISHABLE
            else self.nonperishablepurchaseitem_set.all()
        )

        return self.delivery_cost + sum(
            item.quantity * item.unit_price
            for item in purchase_set
        )


class OrderedPerishablePurchaseSKU(TimeStampedModel):
    """
    Association table between PurchaseOrder and PerishableSKU to capture quantity and unit price of each SKU in a purchase
    """
    purchase = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, db_column='purchase_id')
    sku = models.ForeignKey(PerishableSKU, on_delete=models.CASCADE, db_column='sku_id')
    quantity = models.FloatField(db_column='quantity')
    unit_price = models.FloatField(db_column='unit_price')

    class Meta:
        verbose_name = 'OrderedPerishable Purchase SKU'
        verbose_name_plural = 'Ordered Perishable Purchase SKUs'
    
    def __str__(self):
        return f"{self.purchase.vendor.full_name} - {self.sku.name} - {self.quantity} {self.sku.unit}"
    

class OrderedNonPerishablePurchaseSKU(TimeStampedModel):
    """
    Association table for non-perishable items in a purchase since we don't have a SKU table for non-perishables
    """
    purchase = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, db_column='purchase_id')
    sku = models.ForeignKey(NonPerishableInventory, on_delete=models.CASCADE, db_column='sku_id')
    quantity = models.IntegerField(db_column='quantity')
    unit_price = models.FloatField(db_column='unit_price')

    class Meta:
        verbose_name = 'Ordered Non-Perishable Purchase Item'
        verbose_name_plural = 'OrderedNon-Perishable Purchase Items'
    
    def __str__(self):
        return f"{self.purchase.vendor.full_name} - {self.sku.name} - {self.quantity}"
    

class VendorInvoice(TimeStampedModel):
    purchase = models.ForeignKey(PurchaseOrder,on_delete=models.CASCADE,db_column='purchase_id')

    invoice_number = models.CharField(max_length=100,unique=True,db_column='invoice_number')

    delivery_date = models.DateField(db_column='delivery_date')

    invoice_file = models.FileField(upload_to='procurement/invoices/',null=True,blank=True,db_column='invoice_file')

    class Meta:
        verbose_name = 'Vendor Invoice'
        verbose_name_plural = 'Vendor Invoices'

    def __str__(self):
        return f"Invoice for {self.purchase.vendor.full_name} - {self.purchase.purchase_date}"
    

class DeliveredPerishableInventory(TimeStampedModel):
    """
    Table to track delivered perishable inventory items, linked to the original purchase details.
    This allows us to maintain a record of what was delivered and when, separate from the general inventory tracking.
    The delivered_json will come from the ocr.
    """
    invoice = models.ForeignKey(VendorInvoice, on_delete=models.CASCADE, db_column='invoice_id')
    delivered_json = models.JSONField(db_column='delivered_json')


    class Meta:
        verbose_name = 'Delivered Perishable Inventory'
        verbose_name_plural = 'Delivered Perishable Inventories'
    


class DeliveredNonPerishableInventory(TimeStampedModel):
    """
    Table to track delivered non-perishable inventory items, linked to the original purchase details.
    This allows us to maintain a record of what was delivered and when, separate from the general inventory tracking.
    """
    invoice = models.ForeignKey(VendorInvoice, on_delete=models.CASCADE, db_column='invoice_id')
    delivered_json = models.JSONField(db_column='delivered_json')

    class Meta:
        verbose_name = 'Delivered Non-Perishable Inventory'
        verbose_name_plural = 'Delivered Non-Perishable Inventories'


class VendorPurchaseLog(TimeStampedModel):
    """
    Log table to capture vendor purchase details.
    As of now, we are just capturing the transaction ID and the purchase details, but this needs to be looked into for any other details that we might want to capture for the log.
    """
    purchase = models.OneToOneField(PurchaseOrder, on_delete=models.CASCADE, db_column='purchase_id')
    transaction_id = models.CharField(db_column='transaction_id', max_length=100, unique=True)

    class Meta:
        verbose_name = 'Vendor Purchase Log'
        verbose_name_plural = 'Vendor Purchases Logs'
    
    def __str__(self):
        return f"Payment for {self.purchase.vendor.name} - {self.purchase.purchase_date}"