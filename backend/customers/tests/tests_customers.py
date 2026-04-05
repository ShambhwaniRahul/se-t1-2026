import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from humanresources.models import EmployeeRole
from customers.models import Customer, CustomerPayment
from orders.models import Order, OrderMenuItem, MenuItem, DiningTable

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

@pytest.mark.django_db
class TestCustomerPaymentAPI:
    def setup_method(self):
        self.list_url = "/api/v1/customers/payments/"
        
        self.table = DiningTable.objects.create(
            table_number=101, 
            total_seats=4, 
            is_available=False
        )
        
        self.menu_item = MenuItem.objects.create(
            name="Pasta",
            price=500.0,
            estimated_prep_time=15,
            category=MenuItem.CategoryChoices.MAIN_COURSE
        )

        self.customer = Customer.objects.create(
            phone_no="9876543210",
            first_name="John",
            last_name="Doe"
        )

        self.order = Order.objects.create(
            table=self.table,
            dining_type=Order.DiningTypeChoices.DINE_IN,
            final_total=500.0,
            status=Order.StatusChoices.OPEN
        )

    def test_get_payments_empty_failure(self, auth_client):
        response = auth_client.get(self.list_url)
        assert response.status_code == 400
        assert response.data["success"] is False
        assert response.data["message"] == "Invalid query parameters provided."

    def test_get_payments_success(self, auth_client):
        CustomerPayment.objects.create(
            customer=self.customer,
            order=self.order,
            payment_mode=1,
            usage_type=1,
            earned_loyalty_points=30
        )
        response = auth_client.get(self.list_url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_post_payment_success(self, auth_client):
        OrderMenuItem.objects.create(
            order=self.order,
            menu_item=self.menu_item,
            menu_item_status=OrderMenuItem.StatusChoices.SERVED,
            price_at_time=500.0
        )
        data = {
            "order": self.order.id,
            "customer": self.customer.id,
            "payment_mode": 1,
            "usage_type": 1
        }
        response = auth_client.post(self.list_url, data)
        assert response.status_code == 201
        assert response.data["success"] is True
        self.order.refresh_from_db()
        assert self.order.status == Order.StatusChoices.CLOSED

    def test_post_payment_pending_items_failure(self, auth_client):
        OrderMenuItem.objects.create(
            order=self.order,
            menu_item=self.menu_item,
            menu_item_status=OrderMenuItem.StatusChoices.PENDING,
            price_at_time=500.0
        )
        data = {
            "order": self.order.id,
            "customer": self.customer.id,
            "payment_mode": 1,
            "usage_type": 1
        }
        response = auth_client.post(self.list_url, data)
        
        assert response.status_code == 400
        assert "not yet completed" in response.data["message"]

@pytest.mark.django_db
class TestCustomerPaymentDetailAPI:
    def setup_method(self):
        self.base_url = "/api/v1/customers/payments/"
        self.table = DiningTable.objects.create(table_number=303, total_seats=2, is_available=False)
        self.customer = Customer.objects.create(phone_no="9900887766", first_name="Alice", last_name="Smith")
        
        self.order = Order.objects.create(
            table=self.table, 
            dining_type=Order.DiningTypeChoices.DINE_IN, 
            status=Order.StatusChoices.CLOSED,
            final_total=1500.0
        )
        self.payment = CustomerPayment.objects.create(
            customer=self.customer,
            order=self.order,
            payment_mode=1,
            usage_type=1,
            earned_loyalty_points=90
        )

    def test_get_payment_detail_success(self, auth_client):
        url = f"{self.base_url}{self.payment.id}/"
        response = auth_client.get(url, {"customer_id": self.customer.id})
        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["data"]["id"] == self.payment.id

    def test_get_payment_detail_wrong_customer(self, auth_client):
        other_customer = Customer.objects.create(
            phone_no="1111122222", 
            first_name="Unauthorized")
        url = f"{self.base_url}{self.payment.id}/"
        response = auth_client.get(url, {"customer_id": other_customer.id})
        assert response.status_code == 404