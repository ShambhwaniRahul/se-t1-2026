import json
import logging
import random
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIRequestFactory
from freezegun import freeze_time
import time

# Modular imports from separate apps [cite: 1, 36]
from orders.views import OrderListCreateAPIView
from customers.views import CustomerPaymentListCreateAPIView
from customers.models import Customer
from orders.models import MenuItem
from orders.models import DiningTable, OrderMenuItem

logger = logging.getLogger(__name__)

class TransactionDataSimulator:
    """
    Simulates a 3-year organic growth of orders and payments.
    Handles per-category popularity and strict transactional states[cite: 26, 43].
    """

    def __init__(self, years_back_start: int = 3):
        self.factory = APIRequestFactory()
        current_time = timezone.now()
        self.start_time = current_time - timedelta(days=years_back_start * 365)
        self.end_time = current_time

    def run_phase_4_transactions(self) -> None:
        """
        Executes the dual-app simulation lifecycle[cite: 6, 40].
        """
        order_view = OrderListCreateAPIView.as_view(permission_classes=[])
        payment_view = CustomerPaymentListCreateAPIView.as_view(permission_classes=[])

        # Cache valid IDs to optimize simulation speed [cite: 15, 20]
        customer_ids = list(Customer.objects.values_list('id', flat=True))
        table_ids = list(DiningTable.objects.values_list('id', flat=True))
        
        # Organize MenuItems by Category for independent popularity weighting 
        # 0: Starter, 1: Main Course, 2: Dessert, 3: Beverage
        raw_items = MenuItem.objects.all().order_by('category', 'id')
        menu = {0: [], 1: [], 2: [], 3: []}
        for item in raw_items:
            menu[item.category].append(item.id)

        # Generate Zipfian weights per category 
        item_weights = {
            cat: [1.0 / (i + 1)**1.5 for i in range(len(items))]
            for cat, items in menu.items()
        }

        total_days = (self.end_time.date() - self.start_time.date()).days
        demand_multipliers = {0: 0.65, 1: 0.70, 2: 0.85, 3: 1.00, 4: 1.60, 5: 1.90, 6: 1.70}

        for day_offset in range(total_days):
            start = time.time()
            current_date = self.start_time + timedelta(days=day_offset)
            
            # Linear growth calculation: 10 to 100 orders/day
            base_volume = 10 + (90 * (day_offset / total_days))
            target_orders = int(base_volume * demand_multipliers[current_date.weekday()] * random.uniform(0.95, 1.05))

            for _ in range(target_orders):
                # Bimodal time distribution (Lunch vs Dinner)
                hour = random.gauss(13.5, 1.0) if random.random() < 0.35 else random.gauss(20.5, 1.5)
                order_time = current_date.replace(hour=max(11, min(23, int(hour))), minute=random.randint(0, 59))

                # Archetype logic with categorical selection [cite: 26, 27]
                archetype = random.choices(['SIMPLE', 'PARTY', 'CORP'], weights=[60, 30, 10])[0]
                cart_items = []

                if archetype == 'SIMPLE':
                    # 1 Main + Optional Beverage
                    cart_items.append(random.choices(menu[1], weights=item_weights[1])[0])
                    if random.random() > 0.5:
                        cart_items.append(random.choices(menu[3], weights=item_weights[3])[0])
                    dining_type = random.choices([0, 1], weights=[65, 35])[0] 

                elif archetype == 'PARTY':
                    # 2 Starters, 3 Mains, 2 Desserts
                    for _ in range(2): cart_items.append(random.choices(menu[0], weights=item_weights[0])[0])
                    for _ in range(3): cart_items.append(random.choices(menu[1], weights=item_weights[1])[0])
                    for _ in range(2): cart_items.append(random.choices(menu[2], weights=item_weights[2])[0])
                    dining_type = 0 # Dine-in

                else: # CORP
                    for _ in range(5): cart_items.append(random.choices(menu[0], weights=item_weights[0])[0])
                    for _ in range(8): cart_items.append(random.choices(menu[1], weights=item_weights[1])[0])
                    dining_type = 0

                # --- Phase A: Create Order [cite: 6] ---
                order_payload = {
                    "table": random.choice(table_ids),
                    "dining_type": dining_type,
                    "packaging_cost": random.randint(20, 50) if dining_type == 1 else 0,
                    "items": [{"menu_item": mid, "special_instructions": ""} for mid in cart_items]
                }
                # print(order_payload)
                # continue
                with freeze_time(order_time):
                    resp = order_view(self.factory.post('/api/orders/', data=json.dumps(order_payload), content_type='application/json'))
                    if resp.status_code >= 400: continue
                    order_id = resp.data.get('data', {}).get('id')

                # --- Phase B: Prepare Items [cite: 32, 43] ---
                # Your payment API requires items to be COMPLETED/SERVED
                OrderMenuItem.objects.filter(order_id=order_id).update(menu_item_status=3) # 3 = Served

                # --- Phase C: Payment [cite: 40, 48] ---
                payment_payload = {
                    "payment_mode": random.choice([0, 1, 2]),
                    "order": order_id,
                    "customer": random.choice(customer_ids)
                }

                with freeze_time(order_time + timedelta(minutes=random.randint(40, 90))):
                    payment_view(self.factory.post('/api/payments/', data=json.dumps(payment_payload), content_type='application/json'))
            end = time.time()
            print(f"Day {day_offset + 1}/{total_days} simulated with {target_orders} orders in {end - start:.2f} seconds.")