from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import EmployeeLoginView, EmployeeRegisterView

urlpatterns = [
    path('auth/login/', EmployeeLoginView.as_view(), name='api-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
    path('auth/register/', EmployeeRegisterView.as_view(), name='api-register'),
]