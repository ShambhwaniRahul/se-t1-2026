import time
import logging
import random
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from freezegun import freeze_time

# Core Model Imports
from customers.models import Customer, CustomerPayment, CustomerPointsBank
from orders.models import MenuItem, DiningTable, Order, OrderMenuItem

# Replace with your actual utility import if needed
# from payments.utils import compute_adjusted_amount, Converter 

logger = logging.getLogger(__name__)

class TransactionDataSimulator:
    """
    Simulates a 3-year organic growth of orders and payments.
    Executes entirely via direct ORM and batched atomic transactions for maximum throughput.
    """

    def __init__(self, years_back_start: int = 3):
        current_time = timezone.now() + timedelta(hours=5, minutes=30)  # Adjusting to IST
        self.start_time = current_time - timedelta(days=years_back_start * 365)
        self.end_time = current_time

    def run_phase_4_transactions(self) -> None:
        """
        Executes the dual-app simulation lifecycle using atomic batching.
        """
        # Pre-cache database entities into memory to avoid SELECT queries in the loop
        customer_ids = list(Customer.objects.values_list('id', flat=True))
        table_ids = list(DiningTable.objects.values_list('id', flat=True))
        
        # Cache MenuItems as objects to instantly access .price and .category
        all_menu_items = {item.id: item for item in MenuItem.objects.all()}
        
        menu = {0: [], 1: [], 2: [], 3: []}
        for item in all_menu_items.values():
            menu[item.category].append(item.id)

        # Generate Zipfian weights per category
        item_weights = {
            cat: [1.0 / (i + 1)**1.5 for i in range(len(items))]
            for cat, items in menu.items()
        }

        total_days = (self.end_time.date() - self.start_time.date()).days
        demand_multipliers = {0: 0.65, 1: 0.70, 2: 0.85, 3: 1.00, 4: 1.60, 5: 1.90, 6: 1.70}
        logger.info(f"Initiating high-speed ORM simulation for {total_days} days.")
        for day_offset in range(total_days):
            if day_offset < total_days - 1:
                continue
            start = time.time()
            current_date = self.start_time + timedelta(days=day_offset)
            base_volume = 10 + (90 * (day_offset / total_days))
            target_orders = int(base_volume * demand_multipliers[current_date.weekday()] * random.uniform(0.95, 1.05))
            # Database execution block: Holds all inserts in memory until the loop finishes
            with transaction.atomic():
                daily_order_items = []
                daily_payments = []
                daily_points = []

                for _ in range(target_orders):
                    hour = random.gauss(13.5, 1.0) if random.random() < 0.35 else random.gauss(20.5, 1.5)
                    order_time = current_date.replace(hour=max(11, min(23, int(hour))), minute=random.randint(0, 59))

                    archetype = random.choices(['SIMPLE', 'PARTY', 'CORP'], weights=[60, 30, 10])[0]
                    selected_item_ids = []

                    if archetype == 'SIMPLE':
                        selected_item_ids.append(random.choices(menu[1], weights=item_weights[1])[0])
                        if random.random() > 0.5:
                            selected_item_ids.append(random.choices(menu[3], weights=item_weights[3])[0])
                        dining_type = random.choices([0, 1], weights=[65, 35])[0] 

                    elif archetype == 'PARTY':
                        for _ in range(2): selected_item_ids.append(random.choices(menu[0], weights=item_weights[0])[0])
                        for _ in range(3): selected_item_ids.append(random.choices(menu[1], weights=item_weights[1])[0])
                        for _ in range(2): selected_item_ids.append(random.choices(menu[2], weights=item_weights[2])[0])
                        dining_type = 0 

                    else: 
                        for _ in range(5): selected_item_ids.append(random.choices(menu[0], weights=item_weights[0])[0])
                        for _ in range(8): selected_item_ids.append(random.choices(menu[1], weights=item_weights[1])[0])
                        dining_type = 0

                    packaging_cost = random.randint(20, 50) if dining_type == 1 else 0

                    # Phase A: Direct Order Creation
                    with freeze_time(order_time):
                        order = Order.objects.create(
                            table_id=random.choice(table_ids),
                            dining_type=dining_type,
                            packaging_cost=packaging_cost,
                            status=1 # Closed directly
                        )

                        order_total = 0
                        for mid in selected_item_ids:
                            item_obj = all_menu_items[mid]
                            order_total += item_obj.price
                            
                            daily_order_items.append(
                                OrderMenuItem(
                                    order=order,
                                    menu_item=item_obj,
                                    menu_item_status=3, # Served
                                    price_at_time=item_obj.price,
                                    special_instructions=""
                                )
                            )
                        
                        order.final_total = order_total + packaging_cost
                        order.save(update_fields=['final_total'])

                    # Phase B: Direct Payment Logic
                    payment_time = order_time + timedelta(minutes=random.randint(40, 90))
                    with freeze_time(payment_time):
                        cust_id = random.choice(customer_ids)
                        
                        # Replace with compute_adjusted_amount if loyalty deduction logic is required
                        final_amt_paid = order.final_total 

                        payment = CustomerPayment.objects.create(
                            payment_mode=random.choice([0, 1, 2]),
                            order=order,
                            customer_id=cust_id,
                            amt_paid=final_amt_paid
                        )

                        daily_points.append(
                            CustomerPointsBank(
                                payment=payment,
                                points=int(final_amt_paid * 0.1) # Assuming 10% conversion rate
                            )
                        )

                # Phase C: Bulk Execution
                OrderMenuItem.objects.bulk_create(daily_order_items)
                CustomerPointsBank.objects.bulk_create(daily_points)

            end = time.time()
            print(f"Day {day_offset + 1}/{total_days} simulated with {target_orders} orders in {end - start:.2f} seconds.")