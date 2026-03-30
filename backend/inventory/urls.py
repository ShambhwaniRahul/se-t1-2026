from django.urls import path

from .views import (
    PerishableSKUListCreateAPIView, PerishableSKUDetailAPIView,
    PerishableInventoryListAPIView, PerishableInventoryDetailAPIView,
    NonPerishableInventoryListCreateAPIView, NonPerishableInventoryDetailAPIView
)

urlpatterns = [
    path('perishable-skus/', PerishableSKUListCreateAPIView.as_view(), name='perishable-skus-list-create'),
    path('perishable-skus/<int:pk>/', PerishableSKUDetailAPIView.as_view(), name='perishable-skus-detail'),
    path('perishable-inventory/', PerishableInventoryListAPIView.as_view(), name='perishable-inventory-list-create-update'),
    path('perishable-inventory/<int:pk>/', PerishableInventoryDetailAPIView.as_view(), name='perishable-inventory-detail'),
    path('non-perishable-inventory/', NonPerishableInventoryListCreateAPIView.as_view(), name='non-perishable-inventory-list-create'),
    path('non-perishable-inventory/<int:pk>/', NonPerishableInventoryDetailAPIView.as_view(), name='non-perishable-inventory-detail'),   
]