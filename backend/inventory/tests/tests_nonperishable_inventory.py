import pytest
from rest_framework.test import APIClient
from inventory.models import NonPerishableInventory
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


@pytest.mark.django_db
class TestNonPerishableInventoryAPI:

    def setup_method(self):
        self.url = "/api/v1/inventory/non-perishable-inventory/"

    def test_list(self, auth_client):
        NonPerishableInventory.objects.create(name="Rice", quantity=10)

        response = auth_client.get(self.url)
        assert response.status_code == 200

    def test_get_single(self, auth_client):
        item = NonPerishableInventory.objects.create(name="Rice", quantity=10)

        response = auth_client.get(f"{self.url}{item.id}/")
        assert response.status_code == 200

    def test_get_not_found(self, auth_client):
        response = auth_client.get(f"{self.url}999/")
        assert response.status_code == 404

    def test_delete(self, auth_client):
        item = NonPerishableInventory.objects.create(name="Rice", quantity=10)

        response = auth_client.delete(f"{self.url}{item.id}/")

        assert response.status_code == 204
        assert NonPerishableInventory.objects.count() == 0    