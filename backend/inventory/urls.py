from django.urls import path

from .views import PerishableSKUListCreateAPIView, PerishableSKUDetailAPIView, PerishableInventoryListAPIView, PerishableInventoryDetailAPIView


urlpatterns = [
    path('perishable-skus/', PerishableSKUListCreateAPIView.as_view(), name='perishable-skus-list-create'),
    path('perishable-skus/<int:pk>/', PerishableSKUDetailAPIView.as_view(), name='perishable-skus-detail'),
    path('perishable-inventory/', PerishableInventoryListAPIView.as_view(), name='perishable-inventory-list'),
    path('perishable-inventory/<int:pk>/', PerishableInventoryDetailAPIView.as_view(), name='perishable-inventory-detail'),

    
]