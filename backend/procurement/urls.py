from django.urls import path
from .views import VendorListCreateView

urlpatterns =[
    path('vendors/', VendorListCreateView.as_view(), name='vendor-list-create'),
    path('vendors/<int:pk>/', VendorListCreateView.as_view(), name='vendor-detail'),
]