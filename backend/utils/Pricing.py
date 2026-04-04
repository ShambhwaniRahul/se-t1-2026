from django.utils import timezone
from backend.orders.models import MenuItem, Discounts

def get_current_price(menu_item_obj):
        """
        Returns the current price after applying the latest valid discount (if any).
        """
    
        today = timezone.now().date()
    
        # 🔥 Latest discounts first
        discounts = Discounts.objects.filter(
            menu_item=menu_item_obj
        ).order_by('-created_at')
    
        for discount in discounts:
            days_passed = (today - discount.created_at.date()).days
    
            # ✅ Valid discount check
            if days_passed <= discount.validity:
                discounted_price = menu_item_obj.price * (1 - discount.rate)
                return round(discounted_price, 2)
    
        # ❌ No valid discount
        return menu_item_obj.price