import pytest
from orders.models import DiningTable

BASE = "/api/v1/orders"


@pytest.mark.django_db
class TestDiningTableAPI:

    def setup_method(self):
        self.url = f"{BASE}/diningtables/"

    def test_create_table(self, auth_client):
        response = auth_client.post(self.url, {
            "table_number": 1,
            "total_seats": 4
        })

        assert response.status_code == 201


    def test_invalid_table_number(self, auth_client):
        response = auth_client.post(self.url, {
            "table_number": -1,
            "total_seats": 4
        })

        assert response.status_code == 400
