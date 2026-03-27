from django.urls import path
from .views import (
    CustomerListCreateAPIView,
    CustomerDetailAPIView,
    CustomerRegisterView,
)

urlpatterns = [
    path('', CustomerListCreateAPIView.as_view(), name='customer-list-create'),
    path('<int:pk>/', CustomerDetailAPIView.as_view(), name='customer-detail'),
    path('auth/register/', CustomerRegisterView.as_view(), name='customer-register'),
]
