from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import EmployeeLoginView, EmployeeRegisterView, EmployeeListView, EmployeeDetailView

urlpatterns = [
    path('auth/login/', EmployeeLoginView.as_view(), name='api-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
    path('auth/register/', EmployeeRegisterView.as_view(), name='api-register'),
    path('auth/employees/', EmployeeListView.as_view(), name='employee-list'),
    path('auth/employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
]