import json
import logging
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIRequestFactory
from freezegun import freeze_time

from orders.views import MenuItemListCreateAPIView

logger = logging.getLogger(__name__)

class InventoryDataSimulator:
    """
    Executes historical inventory generation using statically defined JSON payloads.
    Guarantees absolute predictability in database seeding.
    """

    def __init__(self, years_back_start: int = 3):
        self.factory = APIRequestFactory()
        current_time = timezone.now()
        self.start_time = current_time - timedelta(days=years_back_start * 365)

    def get_static_payloads(self) -> list[dict]:
        """
        Returns the hardcoded list of 70 menu items.
        Prices are pre-calculated to adhere to category averages and non-vegetarian premiums.
        """
        return [
            # CATEGORY 0: STARTERS
            {"name": "Paneer Tikka", "price": 120, "estimated_prep_time": 15, "is_veg": True, "category": 0},
            {"name": "Chicken Tikka", "price": 145, "estimated_prep_time": 15, "is_veg": False, "category": 0},
            {"name": "Gobi Manchurian", "price": 110, "estimated_prep_time": 10, "is_veg": True, "category": 0},
            {"name": "Chilli Paneer", "price": 130, "estimated_prep_time": 12, "is_veg": True, "category": 0},
            {"name": "Chilli Chicken", "price": 155, "estimated_prep_time": 12, "is_veg": False, "category": 0},
            {"name": "Veg Spring Roll", "price": 100, "estimated_prep_time": 15, "is_veg": True, "category": 0},
            {"name": "Chicken Spring Roll", "price": 120, "estimated_prep_time": 15, "is_veg": False, "category": 0},
            {"name": "Garlic Bread", "price": 90, "estimated_prep_time": 10, "is_veg": True, "category": 0},
            {"name": "Cheese Corn Balls", "price": 110, "estimated_prep_time": 12, "is_veg": True, "category": 0},
            {"name": "Fish Tikka", "price": 160, "estimated_prep_time": 15, "is_veg": False, "category": 0},
            {"name": "Mutton Seekh Kebab", "price": 180, "estimated_prep_time": 18, "is_veg": False, "category": 0},
            {"name": "Chicken Seekh Kebab", "price": 150, "estimated_prep_time": 15, "is_veg": False, "category": 0},
            {"name": "Hara Bhara Kebab", "price": 115, "estimated_prep_time": 15, "is_veg": True, "category": 0},
            {"name": "Dahi Ke Sholay", "price": 125, "estimated_prep_time": 12, "is_veg": True, "category": 0},
            {"name": "Tandoori Aloo", "price": 105, "estimated_prep_time": 15, "is_veg": True, "category": 0},
            {"name": "Tandoori Chicken", "price": 170, "estimated_prep_time": 20, "is_veg": False, "category": 0},
            {"name": "Malai Soya Chaap", "price": 135, "estimated_prep_time": 15, "is_veg": True, "category": 0},
            {"name": "Chilli Mushroom", "price": 120, "estimated_prep_time": 10, "is_veg": True, "category": 0},
            {"name": "Crispy Corn", "price": 95, "estimated_prep_time": 10, "is_veg": True, "category": 0},
            {"name": "Dragon Chicken", "price": 160, "estimated_prep_time": 15, "is_veg": False, "category": 0},

            # CATEGORY 1: MAIN COURSES
            {"name": "Butter Chicken", "price": 300, "estimated_prep_time": 25, "is_veg": False, "category": 1},
            {"name": "Paneer Butter Masala", "price": 250, "estimated_prep_time": 20, "is_veg": True, "category": 1},
            {"name": "Dal Makhani", "price": 220, "estimated_prep_time": 20, "is_veg": True, "category": 1},
            {"name": "Mutton Rogan Josh", "price": 320, "estimated_prep_time": 30, "is_veg": False, "category": 1},
            {"name": "Chicken Tikka Masala", "price": 290, "estimated_prep_time": 25, "is_veg": False, "category": 1},
            {"name": "Kadai Paneer", "price": 240, "estimated_prep_time": 20, "is_veg": True, "category": 1},
            {"name": "Palak Paneer", "price": 230, "estimated_prep_time": 20, "is_veg": True, "category": 1},
            {"name": "Malai Kofta", "price": 260, "estimated_prep_time": 25, "is_veg": True, "category": 1},
            {"name": "Chana Masala", "price": 200, "estimated_prep_time": 15, "is_veg": True, "category": 1},
            {"name": "Mix Veg Curry", "price": 210, "estimated_prep_time": 15, "is_veg": True, "category": 1},
            {"name": "Chicken Curry", "price": 280, "estimated_prep_time": 25, "is_veg": False, "category": 1},
            {"name": "Mutton Curry", "price": 310, "estimated_prep_time": 30, "is_veg": False, "category": 1},
            {"name": "Fish Curry", "price": 300, "estimated_prep_time": 25, "is_veg": False, "category": 1},
            {"name": "Egg Curry", "price": 240, "estimated_prep_time": 20, "is_veg": False, "category": 1},
            {"name": "Dal Tadka", "price": 190, "estimated_prep_time": 15, "is_veg": True, "category": 1},
            {"name": "Paneer Lababdar", "price": 255, "estimated_prep_time": 20, "is_veg": True, "category": 1},
            {"name": "Bhindi Masala", "price": 180, "estimated_prep_time": 15, "is_veg": True, "category": 1},
            {"name": "Baingan Bharta", "price": 190, "estimated_prep_time": 20, "is_veg": True, "category": 1},
            {"name": "Aloo Gobi", "price": 170, "estimated_prep_time": 15, "is_veg": True, "category": 1},
            {"name": "Dum Aloo", "price": 200, "estimated_prep_time": 20, "is_veg": True, "category": 1},
            {"name": "Chicken Chettinad", "price": 300, "estimated_prep_time": 25, "is_veg": False, "category": 1},
            {"name": "Mutton Korma", "price": 330, "estimated_prep_time": 30, "is_veg": False, "category": 1},
            {"name": "Mutton Biryani", "price": 350, "estimated_prep_time": 35, "is_veg": False, "category": 1},
            {"name": "Chicken Biryani", "price": 310, "estimated_prep_time": 30, "is_veg": False, "category": 1},
            {"name": "Veg Biryani", "price": 260, "estimated_prep_time": 25, "is_veg": True, "category": 1},
            {"name": "Prawn Curry", "price": 340, "estimated_prep_time": 25, "is_veg": False, "category": 1},
            {"name": "Garlic Naan", "price": 50, "estimated_prep_time": 5, "is_veg": True, "category": 1},
            {"name": "Butter Naan", "price": 40, "estimated_prep_time": 5, "is_veg": True, "category": 1},
            {"name": "Tandoori Roti", "price": 30, "estimated_prep_time": 5, "is_veg": True, "category": 1},
            {"name": "Jeera Rice", "price": 120, "estimated_prep_time": 10, "is_veg": True, "category": 1},

            # CATEGORY 2: DESSERTS
            {"name": "Gulab Jamun", "price": 100, "estimated_prep_time": 5, "is_veg": True, "category": 2},
            {"name": "Rasmalai", "price": 140, "estimated_prep_time": 5, "is_veg": True, "category": 2},
            {"name": "Gajar Ka Halwa", "price": 150, "estimated_prep_time": 10, "is_veg": True, "category": 2},
            {"name": "Moong Dal Halwa", "price": 160, "estimated_prep_time": 10, "is_veg": True, "category": 2},
            {"name": "Vanilla Ice Cream", "price": 90, "estimated_prep_time": 5, "is_veg": True, "category": 2},
            {"name": "Chocolate Brownie", "price": 180, "estimated_prep_time": 10, "is_veg": True, "category": 2},
            {"name": "Cheesecake", "price": 220, "estimated_prep_time": 10, "is_veg": True, "category": 2},
            {"name": "Tiramisu", "price": 240, "estimated_prep_time": 10, "is_veg": True, "category": 2},
            {"name": "Fruit Salad", "price": 130, "estimated_prep_time": 5, "is_veg": True, "category": 2},
            {"name": "Kulfi", "price": 110, "estimated_prep_time": 5, "is_veg": True, "category": 2},

            # CATEGORY 3: BEVERAGES
            {"name": "Coke", "price": 60, "estimated_prep_time": 2, "is_veg": True, "category": 3},
            {"name": "Diet Coke", "price": 60, "estimated_prep_time": 2, "is_veg": True, "category": 3},
            {"name": "Sprite", "price": 60, "estimated_prep_time": 2, "is_veg": True, "category": 3},
            {"name": "Sweet Lassi", "price": 80, "estimated_prep_time": 5, "is_veg": True, "category": 3},
            {"name": "Mango Lassi", "price": 90, "estimated_prep_time": 5, "is_veg": True, "category": 3},
            {"name": "Masala Chaas", "price": 50, "estimated_prep_time": 5, "is_veg": True, "category": 3},
            {"name": "Fresh Lime Soda", "price": 70, "estimated_prep_time": 5, "is_veg": True, "category": 3},
            {"name": "Cold Coffee", "price": 110, "estimated_prep_time": 5, "is_veg": True, "category": 3},
            {"name": "Masala Chai", "price": 40, "estimated_prep_time": 5, "is_veg": True, "category": 3},
            {"name": "Iced Tea", "price": 80, "estimated_prep_time": 5, "is_veg": True, "category": 3},
        ]

    def generate_menu_items(self) -> None:
        """
        Iterates over the static payload configuration and triggers the DRF view execution.
        """
        view_function = MenuItemListCreateAPIView.as_view(permission_classes=[])
        payloads = self.get_static_payloads()

        logger.info(f"Seeding {len(payloads)} static menu items...")

        for payload in payloads:
            request = self.factory.post(
                '/api/menuitems/',
                data=json.dumps(payload),
                content_type='application/json'
            )
            
            with freeze_time(self.start_time):
                response = view_function(request)
                
                if response.status_code >= 400:
                    logger.error(f"Validation failure for '{payload['name']}'. Status: {response.status_code}, Payload: {response.data}")
                    raise ValueError(f"Menu item creation halted on '{payload['name']}'.")