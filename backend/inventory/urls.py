from django.urls import path

from .views import PerishableSKUListCreateAPIView, NonPerishableInventoryViewSet # PerishableInventoryListCreateAPIView


urlpatterns = [
    path('perishable-skus/', PerishableSKUListCreateAPIView.as_view(), name='perishable-skus-list-create'),
    path('perishable-skus/<int:pk>/', PerishableSKUListCreateAPIView.as_view(), name='perishable-skus-detail'),
    path('non-perishable-inventory/', NonPerishableInventoryViewSet.as_view(), name='non-perishable-inventory-list-create'),
    path('non-perishable-inventory/<int:pk>/', NonPerishableInventoryViewSet.as_view(), name='non-perishable-inventory-detail'),

    
    # path('perishable-inventory/', PerishableInventoryListCreateAPIView.as_view(), name='perishable-inventory'),
    # path('perishable-inventory/<int:pk>/', PerishableInventoryListCreateAPIView.as_view(), name='perishable-inventory'),
]

# The type of requests for perishable-inventory/ endpoint are:-
# 1. GET : /perishable-inventory/ : Will return a list of all perishable inventory items.
# 2. GET : /perishable-inventory/?sku=<int:sku_id>/ : Will return a list of perishable inventory items filtered by the specified SKU ID.
# 3. GET : /perishable-inventory/<int:pk>/ : Will return the details of a specific perishable inventory item identified by its primary key (ID).