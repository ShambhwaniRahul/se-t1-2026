from .views import RevenueKPIsView, RevenueByDateView, RecentOrdersView, SalesByCategoryView, TopSellingItemsView, ActiveTablesView, RevenueOverTimeView, OrderVersusRevenueView
from django.urls import path

urlpatterns = [
    # PART 1 - DASHBOARD URLS
    path('revenue-kpis/', RevenueKPIsView.as_view(), name='revenue-kpis'),
    path('active-tables/', ActiveTablesView.as_view(), name='active-tables'),
    path('revenue-by-date/', RevenueByDateView.as_view(), name='revenue-by-date'),
    path('recent-orders/', RecentOrdersView.as_view(), name='recent-orders'),
    path('sales-by-category/', SalesByCategoryView.as_view(), name='sales-by-category'),
    path('top-selling-items/', TopSellingItemsView.as_view(), name='top-selling-items'),

    # PART 2 - ANALYTICS URLS
    path('revenue-over-time/', RevenueOverTimeView.as_view(), name='revenue-over-time'),
    path('order-versus-revenue/', OrderVersusRevenueView.as_view(), name='order-versus-revenue'),
]