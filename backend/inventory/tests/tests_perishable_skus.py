import pytest
from rest_framework.test import APIClient
from inventory.models import PerishableSKU
from django.contrib.auth import get_user_model
from humanresources.models import EmployeeRole


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
# LIST + CREATE
# =========================
@pytest.mark.django_db
class TestPerishableSKUAPI:

    def setup_method(self):
        self.url = "/api/v1/inventory/perishable-skus/"

    def test_list_unauthorized(self, client_no_auth):
        response = client_no_auth.get(self.url)
        assert response.status_code in [401, 403]

    def test_create_success(self, auth_client):
        data = {"name": "Milk", "unit": "L", "typical_shelf_life": 3}

        response = auth_client.post(self.url, data)

        assert response.status_code == 201
        assert PerishableSKU.objects.count() == 1

    def test_create_invalid(self, auth_client):
        data = {"name": "", "unit": "L", "typical_shelf_life": -1}

        response = auth_client.post(self.url, data)

        assert response.status_code == 400

    def test_create_duplicate(self, auth_client):
        PerishableSKU.objects.create(name="Milk", unit="L", typical_shelf_life=3)

        response = auth_client.post(self.url, {
            "name": "milk",
            "unit": "L",
            "typical_shelf_life": 5
        })

        assert response.status_code == 400


# =========================
# DETAIL
# =========================
@pytest.mark.django_db
class TestPerishableSKUDetailAPI:

    def setup_method(self):
        self.sku = PerishableSKU.objects.create(
            name="Milk",
            unit="L",
            typical_shelf_life=3
        )
        self.url = f"/api/v1/inventory/perishable-skus/{self.sku.id}/"

    def test_get_single(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200

    def test_get_not_found(self, auth_client):
        response = auth_client.get("/api/v1/inventory/perishable-skus/999/")
        assert response.status_code == 404

    def test_update_success(self, auth_client):
        response = auth_client.patch(self.url, {"typical_shelf_life": 10})
        assert response.status_code == 200

    def test_update_invalid(self, auth_client):
        response = auth_client.patch(self.url, {"typical_shelf_life": -5})
        assert response.status_code == 400

    def test_update_duplicate(self, auth_client):
        PerishableSKU.objects.create(name="Rice", unit="KG", typical_shelf_life=30)

        response = auth_client.patch(self.url, {"name": "Rice"})
        assert response.status_code == 400

    def test_delete(self, auth_client):
        response = auth_client.delete(self.url)

        assert response.status_code == 204
        assert PerishableSKU.objects.count() == 0

    def test_delete_not_found(self, auth_client):
        response = auth_client.delete("/api/v1/inventory/perishable-skus/999/")
        assert response.status_code == 404
