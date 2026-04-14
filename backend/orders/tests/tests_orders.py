import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from humanresources.models import EmployeeRole
from orders.models import Order, OrderMenuItem, MenuItem, DiningTable

BASE = "/api/v1/pos"


# =========================
# AUTH FIXTURES
# =========================
@pytest.fixture
def auth_client(db):
    """Client for a Waiter"""
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
        role=EmployeeRole.RoleChoices.WAITER
    )

    client.force_authenticate(user=user)
    return client


@pytest.fixture
def chef_client(db):
    """Client for a Chef"""
    client = APIClient()
    User = get_user_model()

    user = User.objects.create_user(
        first_name="Chef",
        last_name="User",
        gender=0,
        email="chef@example.com",
        phone_no="9999999998",
        monthly_salary=10000,
        is_staff=True,
        password="testpass"
    )

    EmployeeRole.objects.create(
        employee=user,
        role=EmployeeRole.RoleChoices.CHEF
    )

    client.force_authenticate(user=user)
    return client


@pytest.fixture
def base_data(db):
    """Base data for testing"""
    item1 = MenuItem.objects.create(name="Pizza", price=100, estimated_prep_time=30, is_veg=False)
    item2 = MenuItem.objects.create(name="Burger", price=80, estimated_prep_time=20, is_veg=True)

    table = DiningTable.objects.create(table_number=1, total_seats=4)

    return {
        "item1": item1,
        "item2": item2,
        "table": table
    }


# =========================
# ORDER API
# =========================
@pytest.mark.django_db
class TestOrderAPI:

    def setup_method(self):
        self.url = f"{BASE}/orders/"

    def test_create_order_success(self, auth_client, base_data):
        print("❌❌❌",base_data["table"].id, type(base_data["table"].id),"🔥🔥🔥")
        payload = {
            "table": base_data["table"].id,
            "dining_type": 0,
            "packaging_cost": 0,
            "items": [
                {
                    "menu_item": base_data["item1"].id,
                    "special_instructions": "",
                    "price_at_time": 100
                }
            ]
        }

        response = auth_client.post(self.url, payload, format="json")

        assert response.status_code == 201
        assert response.data["success"] is True
        assert "id" in response.data["data"]

    def test_list_orders(self, auth_client, base_data):
        auth_client.post(self.url, {
            "table": base_data["table"].id,
            "dining_type": 0,
            "packaging_cost": 0,
            "items": [
                {
                    "menu_item": base_data["item1"].id,
                    "special_instructions": "",
                    "price_at_time": 100
                }
            ]
        }, format="json")

        response = auth_client.get(self.url)

        assert response.status_code == 200
        assert response.data["success"] is True


# =========================
# ADD ITEMS
# =========================
@pytest.mark.django_db
class TestAddItemsToOrder:

    def setup_method(self):
        self.url_template = f"{BASE}/orders/{{}}/add-items/"

    def test_add_items_success(self, auth_client, base_data):
        # Create order
        order_res = auth_client.post(f"{BASE}/orders/", {
            "table": base_data["table"].id,
            "dining_type": 0,
            "packaging_cost": 0,
            "items": [
                {
                    "menu_item": base_data["item1"].id,
                    "special_instructions": "",
                    "price_at_time": 100
                }
            ]
        }, format="json")

        order_id = order_res.data["data"]["id"]
        url = self.url_template.format(order_id)

        response = auth_client.post(url, {
            "items": [
                {
                    "menu_item": base_data["item2"].id,
                    "special_instructions": ""
                }
            ]
        }, format="json")

        assert response.status_code == 200
        assert response.data["success"] is True
        assert "new_total" in response.data["data"]


# =========================
# STATUS UPDATE
# =========================
@pytest.mark.django_db
class TestOrderMenuItemStatus:

    def setup_method(self):
        # Corrected URL format to match urls.py (orders/<pk>/menuitems/<menuitem_id>/status/)
        self.url_template = f"{BASE}/orders/{{}}/menuitems/{{}}/status/"

    def test_valid_status_transition(self, auth_client, chef_client, base_data):
        # 1. Use auth_client (Waiter) to create the order, as Chefs do not have POST permissions
        order_res = auth_client.post(f"{BASE}/orders/", {
            "table": base_data["table"].id,
            "dining_type": 0,
            "packaging_cost": 0,
            "items": [
                {
                    "menu_item": base_data["item1"].id,
                    "special_instructions": "",
                    "price_at_time": 100
                }
            ]
        }, format="json")

        order_id = order_res.data["data"]["id"]

        # Fetch order item
        from orders.models import OrderMenuItem
        item = OrderMenuItem.objects.filter(order_id=order_id).first()

        # Format URL with BOTH order_id and item_id
        url = self.url_template.format(order_id, item.id)

        # 2. Use chef_client to transition status from PENDING (0) to IN_PROGRESS (1)
        response = chef_client.patch(url, {
            "menu_item_status": 1
        }, format="json")

        assert response.status_code == 200
        assert response.data["success"] is True


# =========================
# DELETE
# =========================
@pytest.mark.django_db
class TestOrderMenuItemDelete:

    def setup_method(self):
        # Corrected URL format to match urls.py (orders/<pk>/menuitems/<menuitem_id>/)
        self.url_template = f"{BASE}/orders/{{}}/menuitems/{{}}/"

    def test_delete_pending_item(self, auth_client, base_data):
        order_res = auth_client.post(f"{BASE}/orders/", {
            "table": base_data["table"].id,
            "dining_type": 0,
            "packaging_cost": 0,
            "items": [
                {
                    "menu_item": base_data["item1"].id,
                    "special_instructions": "",
                    "price_at_time": 100
                }
            ]
        }, format="json")

        order_id = order_res.data["data"]["id"]

        from orders.models import OrderMenuItem
        item = OrderMenuItem.objects.filter(order_id=order_id).first()

        # Format URL with BOTH order_id and item_id
        url = self.url_template.format(order_id, item.id)

        response = auth_client.delete(url)

        assert response.status_code == 204