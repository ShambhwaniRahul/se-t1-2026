from .views import RevenueKPIsView, RevenueByDateView, RecentOrdersView, SalesByCategoryView, TopSellingItemsView
from django.urls import path

urlpatterns = [
    path('revenue-kpis/', RevenueKPIsView.as_view(), name='revenue-kpis'),
    path('revenue-by-date/', RevenueByDateView.as_view(), name='revenue-by-date'),
    path('recent-orders/', RecentOrdersView.as_view(), name='recent-orders'),
    path('sales-by-category/', SalesByCategoryView.as_view(), name='sales-by-category'),
    path('top-selling-items/', TopSellingItemsView.as_view(), name='top-selling-items'),
]