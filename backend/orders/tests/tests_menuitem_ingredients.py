import pytest
from orders.models import MenuItemIngredient
from inventory.models import PerishableInventory, PerishableSKU



BASE = "/api/v1/orders/menuitem-ingredients/"


# =========================
# HELPERS
# =========================

@pytest.fixture
def sku(db):
    return PerishableSKU.objects.create(
        name="Tomato",
        unit="KG",
        typical_shelf_life=3
    )
@pytest.fixture
def ingredient(db,sku):
    
    return PerishableInventory.objects.create(
        sku_id=sku.id,   # adjust if required
        quantity=10,
        purchase_date="2022-01-01"
    )


@pytest.fixture
def menu_item_ingredient(base_data, ingredient):
    return MenuItemIngredient.objects.create(
        menu_item=base_data["item1"],
        ingredient_name=ingredient,
        quantity_required=5
    )


# =========================
# LIST API
# =========================

@pytest.mark.django_db
class TestMenuItemIngredientList:

    def test_list_success(self, manager_client, menu_item_ingredient):
        response = manager_client.get(BASE)

        assert response.status_code == 200
        assert response.data["success"] is True

    def test_filter_by_menu_item(self, manager_client, menu_item_ingredient):
        response = manager_client.get(BASE, {
            "menu_item_id": menu_item_ingredient.menu_item.id
        })

        assert response.status_code == 200
        assert len(response.data["data"]) >= 1

    def test_no_data(self, manager_client):
        response = manager_client.get(BASE)

        assert response.status_code == 404
        assert response.data["success"] is False


# =========================
# CREATE API
# =========================

@pytest.mark.django_db
class TestMenuItemIngredientCreate:

    def test_create_success(self, manager_client, base_data, ingredient):
        payload = {
            "menu_item": base_data["item1"].id,
            "ingredient_name": ingredient.id,
            "quantity_required": 3
        }

        response = manager_client.post(BASE, payload)

        assert response.status_code == 201
        assert MenuItemIngredient.objects.count() == 1

    def test_create_forbidden_for_chef(self, chef_client, base_data, ingredient):
        payload = {
            "menu_item": base_data["item1"].id,
            "ingredient_name": ingredient.id,
            "quantity_required": 3
        }

        response = chef_client.post(BASE, payload)

        assert response.status_code == 403


# =========================
# DETAIL API
# =========================

@pytest.mark.django_db
class TestMenuItemIngredientDetail:

    def test_get_success(self, manager_client, menu_item_ingredient):
        url = f"{BASE}{menu_item_ingredient.id}/"

        response = manager_client.get(url)

        assert response.status_code == 200
        assert response.data["success"] is True

    def test_not_found(self, manager_client):
        response = manager_client.get(f"{BASE}999/")

        assert response.status_code == 404


# =========================
# UPDATE
# =========================

@pytest.mark.django_db
class TestMenuItemIngredientUpdate:

    def test_update_success(self, manager_client, menu_item_ingredient):
        url = f"{BASE}{menu_item_ingredient.id}/"

        response = manager_client.patch(url, {
            "quantity_required": 10
        })

        assert response.status_code == 200

        menu_item_ingredient.refresh_from_db()
        assert menu_item_ingredient.quantity_required == 10


# =========================
# DELETE
# =========================

@pytest.mark.django_db
class TestMenuItemIngredientDelete:

    def test_delete_success(self, manager_client, menu_item_ingredient):
        url = f"{BASE}{menu_item_ingredient.id}/"

        response = manager_client.delete(url)

        assert response.status_code == 204
        assert MenuItemIngredient.objects.count() == 0
