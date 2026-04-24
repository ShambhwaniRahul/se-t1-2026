from django.urls import path
from .views import (
    CustomerListCreateAPIView,
    CustomerDetailAPIView,
    CustomerSearchAPIView,
    CustomerPaymentDetailAPIView,
    CustomerPaymentListCreateAPIView,
    CustomerRegisterView,
    CustomerPointsBankListAPIView,
    CustomerOrdersListAPIView
)

urlpatterns = [
    path('', CustomerListCreateAPIView.as_view(), name='customer-list-create'),
    path('<int:pk>/', CustomerDetailAPIView.as_view(), name='customer-detail'),
    path('auth/register', CustomerRegisterView.as_view(), name='customer-register'),
    path('auth/search', CustomerSearchAPIView.as_view(), name='customer-search'),
    path('payments/', CustomerPaymentListCreateAPIView.as_view(), name='customer-payment-list'),
    path('<int:pk>/orders', CustomerOrdersListAPIView.as_view(), name='customer-orders'),
    path('payments/<int:customer_id>/', CustomerPaymentDetailAPIView.as_view(), name='customer-payment-detail'),
    path('points/<int:customer_id>/', CustomerPointsBankListAPIView.as_view(), name='customer-points-list'),
]
