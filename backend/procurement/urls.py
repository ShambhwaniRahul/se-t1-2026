from django.urls import path
from .views import VendorListCreateView, PurchaseOrderListCreateView, PerishablePurchaseSKUListCreateView, NonPerishablePurchaseSKUListCreateView

urlpatterns =[
    path('vendors/', VendorListCreateView.as_view(), name='vendor-list-create'),
    path('vendors/<int:pk>/', VendorListCreateView.as_view(), name='vendor-detail'),
    path('purchase-orders/', PurchaseOrderListCreateView.as_view(), name='purchase-order-list-create'),
    path('purchase-orders/<int:pk>/', PurchaseOrderListCreateView.as_view(), name='purchase-order-detail'),
    path('perishable-purchase-skus/', PerishablePurchaseSKUListCreateView.as_view(), name='perishable-purchase-sku-list-create'),
    path('perishable-purchase-skus/<int:pk>/', PerishablePurchaseSKUListCreateView.as_view(), name='perishable-purchase-sku-detail'),
    path('non-perishable-purchase-skus/', NonPerishablePurchaseSKUListCreateView.as_view(), name='non-perishable-purchase-sku-list-create'),
    path('non-perishable-purchase-skus/<int:pk>/', NonPerishablePurchaseSKUListCreateView.as_view(), name='non-perishable-purchase-sku-detail'),
]