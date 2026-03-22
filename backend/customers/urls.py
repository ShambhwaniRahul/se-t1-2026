from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerLoginView, CustomerRegisterView

router = DefaultRouter()
router.register(r'', CustomerViewSet, basename='customer')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomerLoginView.as_view(), name='customer-login'),
    path('auth/register/', CustomerRegisterView.as_view(), name='customer-register'),
]