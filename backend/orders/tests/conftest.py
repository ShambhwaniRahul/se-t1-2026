import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from humanresources.models import EmployeeRole
from orders.models import MenuItem, DiningTable


# =========================
# HELPER FUNCTION
# =========================

def create_user_with_role(role):
    User = get_user_model()

    user = User.objects.create_user(
        first_name=f"{role}_user",
        last_name="Test",
        gender=0,
        email=f"name@example.com",
        phone_no=f"99999999{role.value}",
        monthly_salary=10000,
        is_staff=True,
        password="testpass"
    )

    EmployeeRole.objects.create(
        employee=user,
        role=role
    )

    client = APIClient()
    client.force_authenticate(user=user)

    return client


# =========================
# AUTH FIXTURES (ALL ROLES)
# =========================

@pytest.fixture
def owner_client(db):
    return create_user_with_role(EmployeeRole.RoleChoices.OWNER)


@pytest.fixture
def manager_client(db):
    return create_user_with_role(EmployeeRole.RoleChoices.MANAGER)


@pytest.fixture
def chef_client(db):
    return create_user_with_role(EmployeeRole.RoleChoices.CHEF)


@pytest.fixture
def waiter_client(db):
    return create_user_with_role(EmployeeRole.RoleChoices.WAITER)


# 🔥 Optional: backward compatibility
@pytest.fixture
def auth_client(owner_client):
    return owner_client


# =========================
# COMMON BASE DATA
# =========================

@pytest.fixture
def base_data(db):
    item1 = MenuItem.objects.create(
        name="Pizza",
        price=100,
        estimated_prep_time=30,
        is_veg=False
    )

    item2 = MenuItem.objects.create(
        name="Burger",
        price=80,
        estimated_prep_time=20,
        is_veg=True
    )

    table = DiningTable.objects.create(
        table_number=1,
        total_seats=4
    )

    return {
        "item1": item1,
        "item2": item2,
        "table": table
    }
