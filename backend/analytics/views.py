import pandas as pd
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from utils.response import standard_response
from orders.models import Order, DiningTable, OrderMenuItem, MenuItem
from datetime import datetime, time, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from .utils import apply_dynamic_ewma, generate_holt_winters_forecast, generate_sarima_forecast

def validate_date_params(start_date_str, end_date_str):
    """
    Validates date query parameters for format and chronological sequence.
    Returns a dictionary with error details if validation fails, otherwise None.
    """
    start_date = None
    end_date = None

    try:
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return {
            "message": "Invalid date format. Expected YYYY-MM-DD.",
            "status_code": status.HTTP_400_BAD_REQUEST
        }

    if start_date and end_date and start_date > end_date:
        return {
            "message": "The start_date cannot be later than the end_date.",
            "status_code": status.HTTP_400_BAD_REQUEST
        }

    return None


# PART 1 - DASHBOARD VIEW

class RevenueKPIsView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            filters = {"status": Order.StatusChoices.CLOSED}
            if start_date:
                filters["created_at__date__gte"] = start_date
            if end_date:
                filters["created_at__date__lte"] = end_date

            metrics = Order.objects.filter(**filters).aggregate(
                total_revenue=Sum('final_total'),
                total_orders=Count('id')
            )

            total_revenue = metrics['total_revenue'] or 0
            total_orders = metrics['total_orders'] or 0
            average_revenue_per_order = round(total_revenue / total_orders, 2) if total_orders > 0 else 0

            data = {
                "total_revenue": total_revenue,
                "total_orders": total_orders,
                "average_revenue_per_order": average_revenue_per_order,
            }
            
            return standard_response(
                success=True,
                message="Revenue KPIs retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve Revenue KPIs: {str(e)}",
                data={},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ActiveTablesView(APIView):
    def get(self, request):
        try:
            counts = DiningTable.objects.aggregate(
                active=Count('id', filter=Q(is_available=False)),
                inactive=Count('id', filter=Q(is_available=True))
            )
            
            data = {
                "total_tables": (counts['active'] or 0) + (counts['inactive'] or 0),
                "active_tables": counts['active'] or 0,
                "inactive_tables": counts['inactive'] or 0,
            }
            
            return standard_response(
                success=True,
                message="Active tables count retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve active tables count: {str(e)}",
                data={},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RevenueByDateView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            filters = {}
            if start_date:
                filters["created_at__date__gte"] = start_date
            if end_date:
                filters["created_at__date__lte"] = end_date

            revenue_data = Order.objects.filter(**filters).values('created_at__date').annotate(
                total_revenue=Sum('final_total'),
                total_orders=Count('id')
            ).order_by('created_at__date')

            data = []
            for entry in revenue_data:
                date_str = entry['created_at__date'].isoformat()
                rev = entry['total_revenue'] or 0
                count = entry['total_orders'] or 0
                payload = {
                    "date": date_str,
                    "total_revenue": rev,
                    "total_orders": count,
                    "average_revenue": round(rev / count, 2) if count > 0 else 0
                }
                data.append(payload)

            return standard_response(
                success=True,
                message="Revenue by date retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve revenue by date: {str(e)}",
                data={},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SalesByCategoryView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            filters = {}
            if start_date:
                filters["order__created_at__date__gte"] = start_date
            if end_date:
                filters["order__created_at__date__lte"] = end_date

            sales = OrderMenuItem.objects.filter(**filters).values('menu_item__category').annotate(
                total=Sum('price_at_time')
            )
            
            category_choices = dict(MenuItem._meta.get_field('category').choices)

            data = {
                category_choices.get(item['menu_item__category'], item['menu_item__category']): float(item['total']) 
                for item in sales
            }
            
            return standard_response(
                success=True,
                message="Sales by category retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve sales by category: {str(e)}",
                data={},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TopSellingItemsView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            top_n = int(request.query_params.get('top_n', 5))
            filters = {}
            if start_date:
                filters["order__created_at__date__gte"] = start_date
            if end_date:
                filters["order__created_at__date__lte"] = end_date

            items = OrderMenuItem.objects.filter(**filters).values('menu_item__name').annotate(
                sales_count=Count('id')
            ).order_by('-sales_count')[:top_n]

            data = [(item['menu_item__name'], item['sales_count']) for item in items]
            
            return standard_response(
                success=True,
                message="Top selling items retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve top selling items: {str(e)}",
                data=[],
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LeastSellingItemsView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            least_n = int(request.query_params.get('least_n', 5))
            filters = {}
            if start_date:
                filters["order__created_at__date__gte"] = start_date
            if end_date:
                filters["order__created_at__date__lte"] = end_date

            items = OrderMenuItem.objects.filter(**filters).values('menu_item__name').annotate(
                sales_count=Count('id')
            ).order_by('sales_count')[:least_n]

            data = [(item['menu_item__name'], item['sales_count']) for item in items]
            
            return standard_response(
                success=True,
                message="Least selling items retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve least selling items: {str(e)}",
                data=[],
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecentOrdersView(APIView):
    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 5))

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

            return standard_response(
                success=True,
                message="Recent orders retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve recent orders: {str(e)}",
                data=[],
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# PART 2 - ANALYTICS VIEW

class RevenueOverTimeView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            filters = {"status": Order.StatusChoices.CLOSED}
            if start_date:
                filters["created_at__date__gte"] = start_date
            if end_date:
                filters["created_at__date__lte"] = end_date

            revenue_data = Order.objects.filter(**filters).values('created_at__date').annotate(
                Revenue=Sum('final_total')
            ).order_by('created_at__date')

            revenue_df = pd.DataFrame(list(revenue_data))
            
            if revenue_df.empty:
                return standard_response(
                    success=True,
                    message="No revenue data available for the given period.",
                    data={"ewma_trendline": []},
                    status_code=status.HTTP_200_OK
                )

            revenue_df.rename(columns={'created_at__date': 'date'}, inplace=True)
            
            span = int(request.query_params.get('span', 7))
            alpha = float(request.query_params.get('alpha', 0.3))
            
            ewma_df = apply_dynamic_ewma(revenue_df, span=span, alpha=alpha)
            
            data = {
                "ewma_trendline": ewma_df.reset_index().to_dict(orient='records')
            }
            
            return standard_response(
                success=True,
                message="Revenue over time retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve revenue over time: {str(e)}",
                data={},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderVersusRevenueView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            filters = {"status": Order.StatusChoices.CLOSED}
            if start_date:
                filters["created_at__date__gte"] = start_date
            if end_date:
                filters["created_at__date__lte"] = end_date

            order_revenue_data = Order.objects.filter(**filters).values('created_at__date').annotate(
                total_revenue=Sum('final_total'),
                total_orders=Count('id')
            )

            data = {
                item['created_at__date'].isoformat(): {
                    "index": i,
                    "date": item['created_at__date'].isoformat(),
                    "total_revenue": item['total_revenue'],
                    "total_orders": item['total_orders']
                } for i, item in enumerate(order_revenue_data)
            }
            
            return standard_response(
                success=True,
                message="Order versus revenue data retrieved successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to retrieve order versus revenue data: {str(e)}",
                data={},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SalesForecastView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            validation_error = validate_date_params(start_date, end_date)
            if validation_error:
                return standard_response(
                    success=False,
                    message=validation_error["message"],
                    data={},
                    status_code=validation_error["status_code"]
                )

            filters = {"status": Order.StatusChoices.CLOSED}
            if start_date:
                filters["created_at__date__gte"] = start_date
            if end_date:
                filters["created_at__date__lte"] = end_date

            revenue_by_date = Order.objects.filter(**filters).values('created_at__date').annotate(
                Revenue=Sum('final_total')
            ).order_by('created_at__date')

            revenue_df = pd.DataFrame(list(revenue_by_date))
            
            if revenue_df.empty:
                 return standard_response(
                    success=True,
                    message="Insufficient data to generate forecast.",
                    data={"holt_winters_forecast": [], "sarima_forecast": []},
                    status_code=status.HTTP_200_OK
                )

            revenue_df.rename(columns={'created_at__date': 'Date'}, inplace=True)
            revenue_df['Date'] = pd.to_datetime(revenue_df['Date'])
            revenue_df.set_index('Date', inplace=True)
            
            forecast_days = int(request.query_params.get('forecast_days', 14))
            seasonal_periods = int(request.query_params.get('seasonal_periods', 7))

            hw_forecast = generate_holt_winters_forecast(revenue_df, forecast_days=forecast_days, seasonal_periods=seasonal_periods)
            sarima_forecast = generate_sarima_forecast(revenue_df, forecast_days=forecast_days, seasonal_periods=seasonal_periods)

            data = {
                "holt_winters_forecast": hw_forecast.reset_index().to_dict(orient='records'),
                "sarima_forecast": sarima_forecast.reset_index().to_dict(orient='records')
            }

            return standard_response(
                success=True,
                message="Sales forecast generated successfully.",
                data=data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_response(
                success=False,
                message=f"Failed to generate sales forecast: {str(e)}",
                data={},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )