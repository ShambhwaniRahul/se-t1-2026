from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import MenuItemViewSet
from .views import (
    MenuItemListCreateAPIView, MenuItemDetailAPIView,
    MenuItemIngredientListCreateAPIView, MenuItemIngredientDetailAPIView,
    DiningTableListCreateAPIView, DiningTableDetailAPIView, ToggleDiningTableAvailabilityAPIView
)


router = DefaultRouter()
# router.register('menuitems', MenuItemViewSet, basename='menuitem')

urlpatterns = [
    path("menuitems/", MenuItemListCreateAPIView.as_view(), name='menuitem-list-create'),
    path("menuitems/<int:pk>/", MenuItemDetailAPIView.as_view(), name='menuitem-detail'),
    path("menuitem-ingredients/", MenuItemIngredientListCreateAPIView.as_view(), name='menuitem-ingredient-list-create'),
    path("menuitem-ingredients/<int:pk>/", MenuItemIngredientDetailAPIView.as_view(), name='menuitem-ingredient-detail'),
    path("diningtables/", DiningTableListCreateAPIView.as_view(), name='diningtable-list-create'),
    path("diningtables/<int:pk>/", DiningTableDetailAPIView.as_view(), name='diningtable-detail'),
    path("diningtables/toggle-table-availability/<int:pk>/", ToggleDiningTableAvailabilityAPIView.as_view(), name='diningtable-toggle-availability'),
]