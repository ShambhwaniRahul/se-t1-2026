from django.urls import path
from .views import (
    VendorListCreateAPIView, VendorDetailAPIView,
    PurchaseOrderListCreateAPIView, PurchaseOrderDetailAPIView,
    OrderedPerishablePurchaseSKUListCreateAPIView, OrderedPerishablePurchaseSKUDetailAPIView,
    OrderedNonPerishablePurchaseSKUListCreateAPIView, OrderedNonPerishablePurchaseSKUDetailAPIView,
    DeliveredPerishablePurchaseInventoryListCreateAPIView, DeliveredPerishablePurchaseInventoryDetailAPIView, 
)


urlpatterns =[
    path('vendors/', VendorListCreateAPIView.as_view(), name='vendor-list-create'),
    path('vendors/<int:pk>/', VendorDetailAPIView.as_view(), name='vendor-detail'),
    path('purchase-orders/', PurchaseOrderListCreateAPIView.as_view(),name='purchaseorder-list-create'),
    path('purchase-orders/<int:pk>/', PurchaseOrderDetailAPIView.as_view(), name='purchaseorder-detail'),
    path('ordered-perishable-purchase-skus/', OrderedPerishablePurchaseSKUListCreateAPIView.as_view(), name='ordered-perishable-purchase-sku-list-create'),
    path('ordered-perishable-purchase-skus/<int:pk>/', OrderedPerishablePurchaseSKUDetailAPIView.as_view(), name='ordered-perishable-purchase-sku-detail'),
    path('ordered-nonperishable-purchase-skus/', OrderedNonPerishablePurchaseSKUListCreateAPIView.as_view(), name='ordered-nonperishable-purchase-sku-list-create'),
    path('ordered-nonperishable-purchase-skus/<int:pk>/', OrderedNonPerishablePurchaseSKUDetailAPIView.as_view(), name='ordered-nonperishable-purchase-sku-detail'),
    path('delivered-perishable-inventory/', DeliveredPerishablePurchaseInventoryListCreateAPIView.as_view(), name='delivered-perishable-inventory-list-create'),
    path('delivered-perishable-inventory/<int:pk>/', DeliveredPerishablePurchaseInventoryDetailAPIView.as_view(), name='delivered-perishable-inventory-detail'),
]