import pandas as pd
from django.shortcuts import render
from rest_framework.views import APIView
from utils.response import standard_response
from orders.models import Order, DiningTable
from datetime import datetime, time, timedelta
from django.utils import timezone
from .utils import apply_dynamic_ewma, generate_holt_winters_forecast, generate_sarima_forecast

# Create your views here.

# PART 1 - DASHBOARD VIEW
class RevenueKPIsView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        orders = Order.objects.filter(status=Order.StatusChoices.CLOSED)

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        total_revenue = sum(order.order_total for order in orders)
        total_orders = orders.count()
        average_revenue_per_order = round(total_revenue / total_orders, 2) if total_orders > 0 else 0

        return standard_response(data={
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "average_revenue_per_order": average_revenue_per_order,
        })


class ActiveTablesView(APIView):
    def get(self, request):
        active_tables = DiningTable.objects.filter(is_available=False)
        inactive_tables = DiningTable.objects.filter(is_available=True)
        return standard_response(data={
            "total_tables": active_tables.count() + inactive_tables.count(),
            "active_tables": active_tables.count(),
            "inactive_tables": inactive_tables.count(),
        })


class RevenueByDateView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        orders = Order.objects.all()

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        revenue_by_date = {}

        for order in orders:
            date_str = order.created_at.date().isoformat()
            if date_str not in revenue_by_date:
                revenue_by_date[date_str] = {"total_revenue": 0, "total_orders": 0, "average_revenue": 0}
            revenue_by_date[date_str]["total_revenue"] += order.total_amount
            revenue_by_date[date_str]["total_orders"] += 1

        for date_str, data in revenue_by_date.items():
            data["average_revenue"] = round(data["total_revenue"] / data["total_orders"], 2)

        return standard_response(data=revenue_by_date)


class SalesByCategoryView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        orders = Order.objects.all()

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        sales_by_category = {}

        for order in orders:
            for item in order.items.all():
                category_name = item.menu_item.get_category_display()
                sales_by_category[category_name] = sales_by_category.get(category_name, 0) + item.item_total

        return standard_response(data=sales_by_category)


class TopSellingItemsView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        top_n = int(request.query_params.get('top_n', 5))

        orders = Order.objects.all()

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        item_sales = {}

        for order in orders:
            for item in order.items.all():
                item_name = item.menu_item.name
                item_sales[item_name] = item_sales.get(item_name, 0) + 1

        sorted_items = sorted(item_sales.items(), key=lambda x: x[1], reverse=True)
        sorted_items = sorted_items[:top_n]

        return standard_response(data=sorted_items)


class LeastSellingItemsView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        least_n = int(request.query_params.get('least_n', 5))

        orders = Order.objects.all()

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        item_sales = {}

        for order in orders:
            for item in order.items.all():
                item_name = item.menu_item.name
                item_sales[item_name] = item_sales.get(item_name, 0) + 1

        sorted_items = sorted(item_sales.items(), key=lambda x: x[1], reverse=False)
        sorted_items = sorted_items[:least_n]
        return standard_response(data=sorted_items)


class RecentOrdersView(APIView):
    def get(self, request):
        limit = int(request.query_params.get('limit', 5))

        recent_orders = Order.objects.order_by('-created_at')[:limit]

        return standard_response(data=[
            {
                "order_id": order.id,
                "table_number": order.table.table_number,
                "status": order.get_status_display(),
                "dining_type": order.get_dining_type_display(),
                "total_items": len(order.items.all()),
                "total_amount": order.order_total,
                "created_at": order.created_at.isoformat(),
                "timedelta_since_order": (timezone.now() - order.created_at).total_seconds() // 60
            }
            for order in recent_orders
        ])


# PART 2 - ANALYTICS VIEW
class RevenueOverTimeView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        orders = Order.objects.filter(status=Order.StatusChoices.CLOSED)
        # orders = Order.objects.all()

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        revenue_data = {}
        span = int(request.query_params.get('span', 1))
        alpha = float(request.query_params.get('alpha', 0.3))
        for order in orders:
            date_str = order.created_at.date().isoformat()
            revenue_data[date_str] = revenue_data.get(date_str, 0) + order.order_total
        revenue_df = pd.DataFrame(list(revenue_data.items()), columns=['Date', 'Revenue'])
        ewma_df = apply_dynamic_ewma(revenue_df, span=span, alpha=alpha)
        return standard_response(data={
            "revenue_over_time": revenue_df.to_dict(orient='records'),
            "ewma_trendline": ewma_df.reset_index().to_dict(orient='records')
        })


class OrderVersusRevenueView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        orders = Order.objects.filter(status=Order.StatusChoices.CLOSED)
        # orders = Order.objects.all()

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        order_revenue_data = {}

        for order in orders:
            date_str = order.created_at.date().isoformat()
            if date_str not in order_revenue_data:
                order_revenue_data[date_str] = {"total_revenue": 0, "total_orders": 0}
            order_revenue_data[date_str]["total_revenue"] += order.order_total
            order_revenue_data[date_str]["total_orders"] += 1
        return standard_response(data=order_revenue_data)


class SalesForecastView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        orders = Order.objects.filter(status=Order.StatusChoices.CLOSED)
        # orders = Order.objects.all()

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        revenue_by_date = {}

        for order in orders:
            date_str = order.created_at.date().isoformat()
            revenue_by_date[date_str] = revenue_by_date.get(date_str, 0) + order.order_total

        revenue_df = pd.DataFrame(list(revenue_by_date.items()), columns=['Date', 'Revenue'])
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