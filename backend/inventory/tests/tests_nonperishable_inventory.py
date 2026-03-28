import pytest
from rest_framework.test import APIClient
from inventory.models import NonPerishableInventory
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
class TestNonPerishableInventoryAPI:

    def setup_method(self):
        self.list_url = "/api/v1/inventory/non-perishable-inventory/"

    # Unauthorized
    def test_list_unauthorized(self, client_no_auth):
        response = client_no_auth.get(self.list_url)
        assert response.status_code in [401, 403]

    # CREATE SUCCESS
    def test_create_item_success(self, auth_client):
        data = {"name": "Spoon", "quantity": 10}

        response = auth_client.post(self.list_url, data)

        assert response.status_code == 201
        assert NonPerishableInventory.objects.count() == 1

    # INVALID CREATE
    def test_create_invalid(self, auth_client):
        data = {"name": "", "quantity": -1}

        response = auth_client.post(self.list_url, data)

        assert response.status_code == 400

    # DUPLICATE
    def test_create_duplicate_item(self, auth_client):
        NonPerishableInventory.objects.create(name="Spoon", quantity=5)

        data = {"name": "spoon", "quantity": 10}

        response = auth_client.post(self.list_url, data)

        assert response.status_code == 400


# =========================
# DETAIL
# =========================
@pytest.mark.django_db
class TestNonPerishableInventoryDetailAPI:

    def setup_method(self):
        self.item = NonPerishableInventory.objects.create(
            name="Spoon",
            quantity=10
        )
        self.detail_url = f"/api/v1/inventory/non-perishable-inventory/{self.item.id}/"

    # GET SINGLE
    def test_get_single(self, auth_client):
        response = auth_client.get(self.detail_url)
        assert response.status_code == 200

    # NOT FOUND
    def test_get_not_found(self, auth_client):
        response = auth_client.get("/api/v1/inventory/non-perishable-inventory/999/")
        assert response.status_code == 404

    # UPDATE
    def test_update(self, auth_client):
        response = auth_client.patch(self.detail_url, {"quantity": 20})
        assert response.status_code == 200

    # INVALID UPDATE
    def test_update_invalid(self, auth_client):
        response = auth_client.patch(self.detail_url, {"quantity": -10})
        assert response.status_code == 400

    # DUPLICATE UPDATE
    def test_update_duplicate_name(self, auth_client):
        NonPerishableInventory.objects.create(name="Fork", quantity=5)

        response = auth_client.patch(self.detail_url, {"name": "Fork"})
        assert response.status_code == 400

    # DELETE
    def test_delete(self, auth_client):
        response = auth_client.delete(self.detail_url)

        assert response.status_code == 204
        assert NonPerishableInventory.objects.count() == 0

    # DELETE NOT FOUND
    def test_delete_not_found(self, auth_client):
        response = auth_client.delete("/api/v1/inventory/non-perishable-inventory/999/")
        assert response.status_code == 404
