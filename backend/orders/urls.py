from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import MenuItemViewSet
from .views import (
    MenuItemListCreateAPIView, MenuItemDetailAPIView,
    MenuItemIngredientListCreateAPIView, MenuItemIngredientDetailAPIView,
    DiningTableListCreateAPIView, DiningTableDetailAPIView, ToggleDiningTableAvailabilityAPIView,
    DiscountsListCreateAPIView,DiscountsDetailAPIView,
    OrderListCreateAPIView, OrderDetailAPIView, AddItemsToOrderAPIView,
    OrderMenuItemListAPIView,OrderMenuItemDetailAPIView,
    UpdateOrderMenuItemStatusAPIView
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
    path("discounts/", DiscountsListCreateAPIView.as_view(), name='discounts-list-create'),
    path("discounts/<int:pk>/", DiscountsDetailAPIView.as_view(), name='discounts-detail'),
    path("orders/", OrderListCreateAPIView.as_view(), name='order-list-create'),
    path("orders/<int:pk>/", OrderDetailAPIView.as_view(), name='order-detail'),
    path("orders/<int:pk>/add-items/", AddItemsToOrderAPIView.as_view(), name='order-add-items'),
    path("orders/<int:pk>/menuitems/", OrderMenuItemListAPIView.as_view(), name='order-menuitem-list'),
    path("orders/<int:pk>/menuitems/<int:menuitem_id>/", OrderMenuItemDetailAPIView.as_view(), name='order-menuitem-detail'),
    path("orders/<int:pk>/menuitems/<int:menuitem_id>/status/", UpdateOrderMenuItemStatusAPIView.as_view(), name='order-menuitem-status'),
]