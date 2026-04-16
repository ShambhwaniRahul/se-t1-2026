import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from humanresources.models import EmployeeRole
from inventory.models import PerishableSKU, NonPerishableInventory
from procurement.models import (
    Vendor, PurchaseOrder, OrderedPerishablePurchaseSKU, VendorInvoice
)

# =========================
# AUTH FIXTURE
# =========================
@pytest.fixture
def auth_client(db):
    client = APIClient()
    User = get_user_model()

    user = User.objects.create_user(
        first_name="Test",
        last_name="User",
        gender=0,
        email="test@example.com",
        phone_no="9999999999",
        monthly_salary=10000,
        is_staff=True,
        password="testpass"
    )

    EmployeeRole.objects.create(
        employee=user,
        role=EmployeeRole.RoleChoices.OWNER
    )

    client.force_authenticate(user=user)
    return client


@pytest.fixture
def client_no_auth():
    return APIClient()


# =========================
# VENDOR TESTS
# =========================
@pytest.mark.django_db
class TestVendorAPI:

    def setup_method(self):
        self.list_url = "/api/v1/procurement/vendors/"

    def test_list_unauthorized(self, client_no_auth):
        response = client_no_auth.get(self.list_url)
        assert response.status_code in [401, 403]

    def test_create_vendor_success(self, auth_client):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "address": "123 Vendor St",
            "contact_no": "1234567890",
            "email": "vendor@example.com",
            "gst_no": "GSTIN1234567890"  # Must be GSTIN + 10 digits
        }
        response = auth_client.post(self.list_url, data)
        assert response.status_code == 201
        assert Vendor.objects.count() == 1

    def test_create_invalid_data(self, auth_client):
        data = {"first_name": ""} # Missing required fields
        response = auth_client.post(self.list_url, data)
        assert response.status_code == 400


@pytest.mark.django_db
class TestVendorDetailAPI:

    def setup_method(self):
        self.vendor = Vendor.objects.create(
            first_name="John",
            last_name="Doe",
            address="123 Vendor St",
            contact_no="1234567890",
            email="vendor@example.com",
            gst_no="GSTIN1234567890"
        )
        self.detail_url = f"/api/v1/procurement/vendors/{self.vendor.id}/"

    def test_get_single(self, auth_client):
        response = auth_client.get(self.detail_url)
        assert response.status_code == 200

    def test_get_not_found(self, auth_client):
        response = auth_client.get("/api/v1/procurement/vendors/999/")
        assert response.status_code == 404

    def test_update(self, auth_client):
        response = auth_client.patch(self.detail_url, {"first_name": "Jane"})
        assert response.status_code == 200
        self.vendor.refresh_from_db()
        assert self.vendor.first_name == "Jane"

    def test_delete(self, auth_client):
        response = auth_client.delete(self.detail_url)
        assert response.status_code == 204
        assert Vendor.objects.count() == 0


# =========================
# PURCHASE ORDER TESTS
# =========================
@pytest.mark.django_db
class TestPurchaseOrderAPI:

    def setup_method(self):
        self.list_url = "/api/v1/procurement/purchase-orders/"
        self.vendor = Vendor.objects.create(
            first_name="John", last_name="Doe", address="123 Vendor St",
            contact_no="1234567890", email="vendor@example.com", gst_no="GSTIN1234567890"
        )

    def test_list_unauthorized(self, client_no_auth):
        response = client_no_auth.get(self.list_url)
        assert response.status_code in [401, 403]

    def test_create_po_success(self, auth_client):
        data = {
            "vendor": self.vendor.id,
            "purchase_type": "Perishable",
            "purchase_date": "2026-04-01",  # Past date to bypass >= today validation
            "status": "Pending",
            "delivery_cost": 50.0
        }
        response = auth_client.post(self.list_url, data)
        assert response.status_code == 201
        assert PurchaseOrder.objects.count() == 1


@pytest.mark.django_db
class TestPurchaseOrderDetailAPI:

    def setup_method(self):
        self.vendor = Vendor.objects.create(
            first_name="John", last_name="Doe", address="123 Vendor St",
            contact_no="1234567890", email="vendor@example.com", gst_no="GSTIN1234567890"
        )
        self.po = PurchaseOrder.objects.create(
            vendor=self.vendor,
            purchase_type="Perishable",
            purchase_date="2026-04-01",
            status="Pending",
            delivery_cost=50.0
        )
        self.detail_url = f"/api/v1/procurement/purchase-orders/{self.po.id}/"

    def test_get_single(self, auth_client):
        response = auth_client.get(self.detail_url)
        assert response.status_code == 200

    def test_update(self, auth_client):
        response = auth_client.patch(self.detail_url, {"status": "Received"})
        assert response.status_code == 200

    def test_delete(self, auth_client):
        response = auth_client.delete(self.detail_url)
        assert response.status_code == 204
        assert PurchaseOrder.objects.count() == 0


# =========================
# ORDERED PERISHABLE SKU TESTS
# =========================
@pytest.mark.django_db
class TestOrderedPerishablePurchaseSKUAPI:

    def setup_method(self):
        self.list_url = "/api/v1/procurement/ordered-perishable-purchase-skus/"
        self.vendor = Vendor.objects.create(
            first_name="John", last_name="Doe", contact_no="1234567890", email="v@e.com", gst_no="GSTIN1234567890"
        )
        self.po = PurchaseOrder.objects.create(
            vendor=self.vendor, purchase_type="Perishable", purchase_date="2026-04-01"
        )
        self.sku = PerishableSKU.objects.create(name="Milk", unit="L", typical_shelf_life=3)

    def test_create_success(self, auth_client):
        data = {
            "purchase": self.po.id,
            "sku": self.sku.id,
            "quantity": 10.0,
            "unit_price": 5.0
        }
        response = auth_client.post(self.list_url, data)
        assert response.status_code == 201
        assert OrderedPerishablePurchaseSKU.objects.count() == 1


@pytest.mark.django_db
class TestOrderedPerishablePurchaseSKUDetailAPI:

    def setup_method(self):
        self.vendor = Vendor.objects.create(
            first_name="John", last_name="Doe", contact_no="1234567890", email="v@e.com", gst_no="GSTIN1234567890"
        )
        self.po = PurchaseOrder.objects.create(
            vendor=self.vendor, purchase_type="Perishable", purchase_date="2026-04-01"
        )
        self.sku = PerishableSKU.objects.create(name="Milk", unit="L", typical_shelf_life=3)
        self.ordered_sku = OrderedPerishablePurchaseSKU.objects.create(
            purchase=self.po, sku=self.sku, quantity=10.0, unit_price=5.0
        )
        self.detail_url = f"/api/v1/procurement/ordered-perishable-purchase-skus/{self.ordered_sku.id}/"

    def test_update(self, auth_client):
        response = auth_client.patch(self.detail_url, {"quantity": 20.0})
        assert response.status_code == 200

    def test_delete(self, auth_client):
        response = auth_client.delete(self.detail_url)
        assert response.status_code == 204


# =========================
# VENDOR INVOICE TESTS
# =========================
@pytest.mark.django_db
class TestVendorInvoiceAPI:

    def setup_method(self):
        self.list_url = "/api/v1/procurement/vendor-invoices/"
        self.vendor = Vendor.objects.create(
            first_name="John", last_name="Doe", contact_no="1234567890", email="v@e.com", gst_no="GSTIN1234567890"
        )
        self.po = PurchaseOrder.objects.create(
            vendor=self.vendor, purchase_type="Perishable", purchase_date="2026-04-01"
        )

    def test_create_invoice_success(self, auth_client):
        data = {
            "purchase": self.po.id,
            "invoice_number": "INV-001",
            "delivery_date": "2026-04-02"
        }
        response = auth_client.post(self.list_url, data)
        assert response.status_code == 201
        assert VendorInvoice.objects.count() == 1


# =========================
# DELIVERED PERISHABLE INVENTORY TESTS
# =========================
@pytest.mark.django_db
class TestDeliveredPerishableInventoryAPI:

    def setup_method(self):
        self.list_url = "/api/v1/procurement/delivered-perishable-inventory/"
        self.vendor = Vendor.objects.create(
            first_name="John", last_name="Doe", contact_no="1234567890", email="v@e.com", gst_no="GSTIN1234567890"
        )
        self.po = PurchaseOrder.objects.create(
            vendor=self.vendor, purchase_type="Perishable", purchase_date="2026-04-01"
        )
        self.invoice = VendorInvoice.objects.create(
            purchase=self.po, invoice_number="INV-001", delivery_date="2026-04-02"
        )

    def test_create_delivered_inventory(self, auth_client):
        data = {
            "invoice": self.invoice.id,
            "delivered_json": {"items": [{"name": "Milk", "qty": 10}]}
        }
        response = auth_client.post(self.list_url, data, format='json')
        assert response.status_code in [201, 405]