from .views import RevenueKPIsView, RevenueByDateView, RecentOrdersView, SalesByCategoryView, TopSellingItemsView, LeastSellingItemsView, ActiveTablesView, RevenueOverTimeView, OrderVersusRevenueView, SalesForecastView
from django.urls import path

urlpatterns = [
    path('revenue-kpis/', RevenueKPIsView.as_view(), name='revenue-kpis'),
    path('active-tables/', ActiveTablesView.as_view(), name='active-tables'),
    path('revenue-by-date/', RevenueByDateView.as_view(), name='revenue-by-date'),
    path('sales-by-category/', SalesByCategoryView.as_view(), name='sales-by-category'),
    path('top-selling-items/', TopSellingItemsView.as_view(), name='top-selling-items'),
    path('least-selling-items/', LeastSellingItemsView.as_view(), name='least-selling-items'),
    path('recent-orders/', RecentOrdersView.as_view(), name='recent-orders'),
    path('revenue-over-time/', RevenueOverTimeView.as_view(), name='revenue-over-time'),
    path('order-versus-revenue/', OrderVersusRevenueView.as_view(), name='order-versus-revenue'),
    path('sales-forecast/', SalesForecastView.as_view(), name='sales-forecast'),
]