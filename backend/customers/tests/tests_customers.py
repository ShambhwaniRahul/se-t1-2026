import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from humanresources.models import EmployeeRole
from customers.models import Customer

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
class TestCustomerCreateAPI:

    def setup_method(self):
        self.list_url = "/api/v1/customers/"

    def test_get_customers_success(self, auth_client):
        customer = Customer.objects.create(
            phone_no="9876543210",
            first_name="John",
            last_name="Doe"
        )

        response = auth_client.get(self.list_url)

        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["message"] == "Customers retrieved successfully."

        data = response.data["data"]

        assert len(data) == 1
        assert data[0]["id"] == customer.id
        assert data[0]["phone_no"] == "9876543210"
        assert data[0]["first_name"] == "John"
        assert data[0]["last_name"] == "Doe"

    def test_get_customers_failure(self, auth_client):
        response = auth_client.get(self.list_url)
        assert response.status_code == 404
        assert response.data['success'] is False
        assert response.data['message'] == "No customers found."

@pytest.mark.django_db
class TestCustomerDetailAPI:
    def setup_method(self):
        self.customer = Customer.objects.create(
            first_name="Raj",
            last_name="Bansal",
            phone_no="1234567891"
        )
        self.list_url = f"/api/v1/customers/{self.customer.id}/"

    def test_get_customer(self, auth_client):
        response = auth_client.get(self.list_url)
        assert response.status_code == 200
        assert response.data['success'] is True
        assert response.data['message'] == "Customer retrieved successfully."
        assert response.data['data']['first_name'] == self.customer.first_name 

    def test_update_customer(self, auth_client):
        response = auth_client.patch(self.list_url, {"phone_no": "1234567892"})
        assert response.status_code == 200
        assert response.data['success'] is True
        assert response.data['message'] == "Customer updated successfully."
        assert response.data['data']['phone_no'] == "1234567892"
    
    def test_delete_customer(self, auth_client):
        response = auth_client.delete(self.list_url)
        assert response.status_code == 204
        assert response.data['success'] is True
        assert response.data['message'] == "Customer deleted successfully."

@pytest.mark.django_db
class TestCustomerRegisterAPI:
    def setup_method(self):
        self.list_url = "/api/v1/customers/auth/register/"

    def test_register_customer(self, auth_client):
        data = {
            "first_name": "Raj",
            "last_name": "Bansal",
            "phone_no": "1234567891",
            # "otp": "123456"
        }
        response = auth_client.post(self.list_url, data)
        assert response.status_code == 201
        assert response.data['success'] is True
        assert response.data['message'] == "Customer created successfully."
        assert response.data['data']['phone_no'] == data['phone_no']

# @pytest.mark.django_db
# class TestCustomerPaymentListAPI:
#     def setup_method(self):
#         self.list_url = "/api/v1/customers/payments/"

#     def test_no_payments_returns_400(self, auth_client):
#         response = auth_client.get(self.url)

#         assert response.status_code == 400
#         assert response.data["success"] is False
#         assert response.data["message"] == "Invalid query parameters provided."

#     def test_get_payments_success(self, auth_client):
#         customer = Customer.objects.create(
#             phone_no="9876543210",
#             first_name="John",
#             last_name="Doe"
#         )

#         response = auth_client.get(self.list_url, {"customer_id": customer.id})

#         assert response.status_code == 200
#         assert response.data["success"] is True
#         assert response.data["message"] == "Payments fetched successfully."
#         assert isinstance(response.data["data"], list)

# @pytest.mark.django_db
# class TestCustomerPaymentDetailListAPI:
#     def setup_method(self):
#         self.list_url = "/api/v1/customers/payments/{}/"