import pytest
from datetime import date, timedelta
from rest_framework.test import APIClient
from inventory.models import PerishableInventory, PerishableSKU
from django.contrib.auth import get_user_model
from humanresources.models import EmployeeRole


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
def sku(db):
    return PerishableSKU.objects.create(
        name="Milk",
        unit="L",
        typical_shelf_life=3
    )


@pytest.mark.django_db
class TestPerishableInventoryAPI:

    def setup_method(self):
        self.url = "/api/v1/inventory/perishable-inventory/"

    def test_list_empty(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 404

    def test_list_success(self, auth_client, sku):
        PerishableInventory.objects.create(
            sku=sku,
            quantity=10,
            purchase_date=date.today()
        )

        response = auth_client.get(self.url)
        assert response.status_code == 200

    def test_filter_by_sku(self, auth_client, sku):
        PerishableInventory.objects.create(
            sku=sku,
            quantity=5,
            purchase_date=date.today()
        )

        response = auth_client.get(f"{self.url}?sku={sku.id}")
        assert response.status_code == 200

    def test_filter_expired(self, auth_client, sku):
        PerishableInventory.objects.create(
            sku=sku,
            quantity=5,
            purchase_date=date.today() - timedelta(days=10)
        )

        response = auth_client.get(f"{self.url}?expired=true")
        assert response.status_code == 200

    def test_get_single(self, auth_client, sku):
        inv = PerishableInventory.objects.create(
            sku=sku,
            quantity=5,
            purchase_date=date.today()
        )

        response = auth_client.get(f"{self.url}{inv.id}/")
        assert response.status_code == 200

    def test_get_not_found(self, auth_client):
        response = auth_client.get(f"{self.url}999/")
        assert response.status_code == 404

    def test_delete_expired(self, auth_client, sku):
        inv = PerishableInventory.objects.create(
            sku=sku,
            quantity=5,
            purchase_date=date.today() - timedelta(days=10)
        )

        response = auth_client.delete(f"{self.url}{inv.id}/")

        assert response.status_code == 204
        assert PerishableInventory.objects.count() == 0

    def test_delete_not_expired(self, auth_client, sku):
        inv = PerishableInventory.objects.create(
            sku=sku,
            quantity=5,
            purchase_date=date.today()
        )

        response = auth_client.delete(f"{self.url}{inv.id}/")

        assert response.status_code == 403
