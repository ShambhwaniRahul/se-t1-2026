import pytest
from orders.models import MenuItem

BASE = "/api/v1/pos"


@pytest.mark.django_db
class TestMenuItemAPI:

    def setup_method(self):
        self.url = f"{BASE}/menuitems/"

    def test_create_menu_item(self, auth_client):
        response = auth_client.post(self.url, {
            "name": "Pizza",
            "price": 100,
            "estimated_prep_time": 20,
            "is_veg": True,
            "category": 1
        })

        assert response.status_code == 201
        assert MenuItem.objects.count() == 1


    def test_list_menu_items_empty(self, auth_client):
        response = auth_client.get(self.url)

        assert response.status_code == 404
