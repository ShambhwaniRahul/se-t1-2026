from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    EmployeeLoginView, EmployeeRegisterView, EmployeeListView, EmployeeDetailView, 
    SalarySlipListCreateAPIView, SalarySlipDetailAPIView, SalarySlipBreakdownListAPIView,   SalarySlipBreakdownDetailAPIView,
    ShiftListCreateAPIView, ShiftDetailAPIView,
    AttendenceLogListCreateAPIView, AttendanceLogDetailAPIView
)

urlpatterns = [
    path('auth/login/', EmployeeLoginView.as_view(), name='api-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
    path('auth/register/', EmployeeRegisterView.as_view(), name='api-register'),
    path('auth/employees/', EmployeeListView.as_view(), name='employee-list'),
    path('auth/employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('auth/salary-slips/', SalarySlipListCreateAPIView.as_view(), name='salary-slip-list-create'),
    path('auth/salary-slips/<int:pk>/', SalarySlipDetailAPIView.as_view(), name='salary-slip-detail'),
    path('auth/salary-breakdowns/', SalarySlipBreakdownListAPIView.as_view(), name='salary-breakdown-list'),
    path('auth/salary-breakdowns/<int:pk>/', SalarySlipBreakdownDetailAPIView.as_view(), name='salary-breakdown-detail'),
    path('auth/shifts/', ShiftListCreateAPIView.as_view(), name='shift-list-create'),
    path('auth/shifts/<int:pk>/', ShiftDetailAPIView.as_view(), name='shift-detail'),
    path('auth/attendance-logs/', AttendenceLogListCreateAPIView.as_view(), name='attendance-log-list'),
    path('auth/attendance-logs/<int:pk>/', AttendanceLogDetailAPIView.as_view(), name='attendance-log-detail'),
]