from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import MenuItemViewSet
from .views import DiningTableListCreateAPIView

router = DefaultRouter()
# router.register('menuitems', MenuItemViewSet, basename='menuitem')

urlpatterns = [
    path('', include(router.urls)),
    path('diningtables/', DiningTableListCreateAPIView.as_view(), name='diningtable-list-create'),
]