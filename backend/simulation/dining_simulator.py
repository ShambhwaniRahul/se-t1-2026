import json
import logging
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIRequestFactory
from freezegun import freeze_time

# Update this import path to match your actual routing
from orders.views import DiningTableListCreateAPIView

logger = logging.getLogger(__name__)

class TableDataSimulator:
    """
    Executes historical dining table generation using statically defined JSON payloads.
    Ensures structural availability for subsequent order simulations.
    """

    def __init__(self, years_back_start: int = 3):
        self.factory = APIRequestFactory()
        current_time = timezone.now()
        self.start_time = current_time - timedelta(days=years_back_start * 365)

    def get_static_payloads(self) -> list[dict]:
        """
        Configuration for 10 dining tables with varied seating capacities.
        """
        return [
            {"table_number": 2, "total_seats": 2, "is_available": True},
            {"table_number": 3, "total_seats": 2, "is_available": True},
            {"table_number": 4, "total_seats": 4, "is_available": True},
            {"table_number": 5, "total_seats": 4, "is_available": True},
            {"table_number": 6, "total_seats": 4, "is_available": True},
            {"table_number": 7, "total_seats": 4, "is_available": True},
            {"table_number": 8, "total_seats": 6, "is_available": True},
            {"table_number": 9, "total_seats": 6, "is_available": True},
            {"table_number": 10, "total_seats": 8, "is_available": True},
        ]

    def generate_tables(self) -> None:
        """
        Iterates over static payloads and triggers the view execution within a frozen temporal context.
        """
        view_function = DiningTableListCreateAPIView.as_view(permission_classes=[])
        payloads = self.get_static_payloads()

        logger.info(f"Seeding {len(payloads)} static dining tables...")

        for payload in payloads:
            request = self.factory.post(
                '/api/dining-tables/',
                data=json.dumps(payload),
                content_type='application/json'
            )
            
            # Pin table creation to 3 years ago
            with freeze_time(self.start_time):
                response = view_function(request)
                
                if response.status_code >= 400:
                    logger.error(f"Validation failure for Table {payload['table_number']}. Status: {response.status_code}, Payload: {response.data}")
                    raise ValueError(f"Table creation halted on Table {payload['table_number']}.")