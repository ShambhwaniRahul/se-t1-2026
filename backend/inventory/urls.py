from django.urls import path

from .views import PerishableSKUListCreateAPIView


urlpatterns = [
    path('perishable-skus/', PerishableSKUListCreateAPIView.as_view(), name='perishable-skus'),
    path('perishable-skus/<int:pk>/', PerishableSKUListCreateAPIView.as_view(), name='perishable-skus'),    
]