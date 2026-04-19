import pandas as pd
from django.shortcuts import render
from rest_framework.views import APIView
from utils.response import standard_response
from orders.models import Order, DiningTable, OrderMenuItem, MenuItem
from datetime import datetime, time, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from .utils import apply_dynamic_ewma, generate_holt_winters_forecast, generate_sarima_forecast

# PART 1 - DASHBOARD VIEW

class RevenueKPIsView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        filters = {"status": Order.StatusChoices.CLOSED}
        if start_date:
            filters["created_at__date__gte"] = start_date
        if end_date:
            filters["created_at__date__lte"] = end_date

        # Use aggregation to perform math in SQL
        metrics = Order.objects.filter(**filters).aggregate(
            total_revenue=Sum('final_total'),
            total_orders=Count('id')
        )

        total_revenue = metrics['total_revenue'] or 0
        total_orders = metrics['total_orders'] or 0
        average_revenue_per_order = round(total_revenue / total_orders, 2) if total_orders > 0 else 0

        return standard_response(data={
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "average_revenue_per_order": average_revenue_per_order,
        })


class ActiveTablesView(APIView):
    def get(self, request):
        # Single database hit to get counts for both states
        counts = DiningTable.objects.aggregate(
            active=Count('id', filter=Q(is_available=False)),
            inactive=Count('id', filter=Q(is_available=True))
        )
        
        return standard_response(data={
            "total_tables": (counts['active'] or 0) + (counts['inactive'] or 0),
            "active_tables": counts['active'] or 0,
            "inactive_tables": counts['inactive'] or 0,
        })


class RevenueByDateView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        filters = {}
        if start_date:
            filters["created_at__date__gte"] = start_date
        if end_date:
            filters["created_at__date__lte"] = end_date

        # Grouping by date in SQL
        revenue_data = Order.objects.filter(**filters).values('created_at__date').annotate(
            total_revenue=Sum('final_total'),
            total_orders=Count('id')
        ).order_by('created_at__date')

        result = {}
        for entry in revenue_data:
            date_str = entry['created_at__date'].isoformat()
            rev = entry['total_revenue'] or 0
            count = entry['total_orders'] or 0
            result[date_str] = {
                "total_revenue": rev,
                "total_orders": count,
                "average_revenue": round(rev / count, 2) if count > 0 else 0
            }

        return standard_response(data=result)


class SalesByCategoryView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        filters = {}
        if start_date:
            filters["order__created_at__date__gte"] = start_date
        if end_date:
            filters["order__created_at__date__lte"] = end_date

        # Execute database-level aggregation returning raw category keys
        sales = OrderMenuItem.objects.filter(**filters).values('menu_item__category').annotate(
            total=Sum('price_at_time')
        )
        
        # Extract model field choices into a dictionary for O(1) lookups
        category_choices = dict(MenuItem._meta.get_field('category').choices)

        # Map raw category keys to human-readable display values
        # Fallback to the raw key if the choice mapping is absent
        return standard_response(data={
            category_choices.get(item['menu_item__category'], item['menu_item__category']): float(item['total']) 
            for item in sales
        })


class TopSellingItemsView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        top_n = int(request.query_params.get('top_n', 5))

        filters = {}
        if start_date:
            filters["order__created_at__date__gte"] = start_date
        if end_date:
            filters["order__created_at__date__lte"] = end_date

        # Aggregate item counts
        items = OrderMenuItem.objects.filter(**filters).values('menu_item__name').annotate(
            sales_count=Count('id')
        ).order_by('-sales_count')[:top_n]

        return standard_response(data=[(item['menu_item__name'], item['sales_count']) for item in items])


class LeastSellingItemsView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        least_n = int(request.query_params.get('least_n', 5))

        filters = {}
        if start_date:
            filters["order__created_at__date__gte"] = start_date
        if end_date:
            filters["order__created_at__date__lte"] = end_date

        # Aggregate item counts
        items = OrderMenuItem.objects.filter(**filters).values('menu_item__name').annotate(
            sales_count=Count('id')
        ).order_by('sales_count')[:least_n]

        return standard_response(data=[(item['menu_item__name'], item['sales_count']) for item in items])


class RecentOrdersView(APIView):
    def get(self, request):
        limit = int(request.query_params.get('limit', 5))

        # Annotate count to prevent N+1 queries
        recent_orders = Order.objects.annotate(
            items_count=Count('items')
        ).order_by('-created_at')[:limit]

        data = []
        now = timezone.now()
        for order in recent_orders:
            data.append({
                "order_id": order.id,
                "table_number": order.table.table_number,
                "status": order.get_status_display(),
                "dining_type": order.get_dining_type_display(),
                "total_items": order.items_count,
                "total_amount": float(order.final_total),
                "created_at": order.created_at.isoformat(),
                "timedelta_since_order": (now - order.created_at).total_seconds() // 60
            })

        return standard_response(data=data)


# PART 2 - ANALYTICS VIEW
class RevenueOverTimeView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        filters = {"status": Order.StatusChoices.CLOSED}
        if start_date:
            filters["created_at__date__gte"] = start_date
        if end_date:
            filters["created_at__date__lte"] = end_date

        revenue_data = Order.objects.filter(**filters).values('created_at__date').annotate(
            Revenue=Sum('final_total')
        ).order_by('created_at__date')

        # Convert queryset to DataFrame
        revenue_df = pd.DataFrame(list(revenue_data))
        revenue_df.rename(columns={'created_at__date': 'date'}, inplace=True)
        
        span = int(request.query_params.get('span', 7))
        alpha = float(request.query_params.get('alpha', 0.3))
        
        ewma_df = apply_dynamic_ewma(revenue_df, span=span, alpha=alpha)
        
        return standard_response(data={
            "ewma_trendline": ewma_df.reset_index().to_dict(orient='records')
        })


class OrderVersusRevenueView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        filters = {"status": Order.StatusChoices.CLOSED}
        if start_date:
            filters["created_at__date__gte"] = start_date
        if end_date:
            filters["created_at__date__lte"] = end_date

        order_revenue_data = Order.objects.filter(**filters).values('created_at__date').annotate(
            total_revenue=Sum('final_total'),
            total_orders=Count('id')
        )

        return standard_response(data={
            item['created_at__date'].isoformat(): {
                "index": i,
                "date": item['created_at__date'].isoformat(),
                "total_revenue": item['total_revenue'],
                "total_orders": item['total_orders']
            } for i, item in enumerate(order_revenue_data)
        })


class SalesForecastView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        filters = {"status": Order.StatusChoices.CLOSED}
        if start_date:
            filters["created_at__date__gte"] = start_date
        if end_date:
            filters["created_at__date__lte"] = end_date

        revenue_by_date = Order.objects.filter(**filters).values('created_at__date').annotate(
            Revenue=Sum('final_total')
        ).order_by('created_at__date')

        revenue_df = pd.DataFrame(list(revenue_by_date))
        revenue_df.rename(columns={'created_at__date': 'Date'}, inplace=True)
        revenue_df['Date'] = pd.to_datetime(revenue_df['Date'])
        revenue_df.set_index('Date', inplace=True)
        
        forecast_days = int(request.query_params.get('forecast_days', 14))
        seasonal_periods = int(request.query_params.get('seasonal_periods', 7))

        hw_forecast = generate_holt_winters_forecast(revenue_df, forecast_days=forecast_days, seasonal_periods=seasonal_periods)
        sarima_forecast = generate_sarima_forecast(revenue_df, forecast_days=forecast_days, seasonal_periods=seasonal_periods)

        return standard_response(data={
            "holt_winters_forecast": hw_forecast.reset_index().to_dict(orient='records'),
            "sarima_forecast": sarima_forecast.reset_index().to_dict(orient='records')
        })