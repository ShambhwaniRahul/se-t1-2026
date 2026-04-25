from enum import Enum
from orders.models import Order
from customers.models import CustomerPayment,CustomerPointsBank
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

class Converter(Enum):
    POINTS_TO_RUPEES = 1
    RUPEES_TO_POINTS = 0.02


def compute_adjusted_amount(final_total, customer_id, is_redeeming, discount):
    """
    Computes how much amount the customer needs to pay after applying loyalty points.
    Also updates the points in FIFO manner (oldest first).

    Returns:
        {
            "amt_paid": float,
            "points_used": int,
            "updated_entries": [CustomerPointsBank, ...]
        }
    """

    if not is_redeeming:
        amt_paid = final_total - (final_total * discount / 100)
        return {"amt_paid": amt_paid, "points_used": 0}

    remaining_amount = final_total
    points_used = 0
    updated_entries = []

    # Calculate the date threshold for 30 days ago
    expiry_threshold = timezone.now() - timedelta(days=30)

    # 🔒 Lock rows with the new filter criteria
    loyalty_entries = (
        CustomerPointsBank.objects
        .select_for_update()
        .filter(
            Q(payment__customer__id=customer_id),
            # points > 0 AND created_at >= 7 days ago
            Q(points__gt=0) & Q(created_at__gte=expiry_threshold)
        )
        .order_by("created_at")   # FIFO
    )

    for entry in loyalty_entries:
        if remaining_amount <= 0:
            break

        # Convert points → rupees
        entry_value_in_rs = entry.points * Converter.POINTS_TO_RUPEES.value  # POINTS_TO_RUPEES = 1

        # ✅ Case 1: Use full entry
        if entry_value_in_rs <= remaining_amount:
            remaining_amount -= entry_value_in_rs
            points_used += entry.points

            entry.points = 0
            updated_entries.append(entry)

        # ✅ Case 2: Partial usage
        else:
            points_needed = int(remaining_amount * Converter.RUPEES_TO_POINTS.value)  # RUPEES_TO_POINTS inverse

            entry.points -= points_needed
            points_used += points_needed
            remaining_amount = 0

            updated_entries.append(entry)
            break

    # 💾 Bulk update DB
    if updated_entries:
        CustomerPointsBank.objects.bulk_update(updated_entries, ["points"])



    return {
        "amt_paid": remaining_amount-(remaining_amount*discount/100),
        "points_used": points_used,
    } 