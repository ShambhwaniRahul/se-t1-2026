from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import RequiresRole
from .models import MenuItem, MenuItemIngredient, DiningTable
from .serializers import MenuItemSerializer, MenuItemIngredientSerializer, DiningTableSerializer
from humanresources.models import EmployeeRole
from django.shortcuts import get_object_or_404

# Create your views here.
class MenuItemListCreateAPIView(APIView):
    """
    API view to list and create menu items.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.CHEF,
                EmployeeRole.RoleChoices.WAITER,
            ]
        else:
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER
            ]
        return super().get_permissions()
    

    def get(self, request):
        """
        List all menu items.
        """
        max_prep_time = request.query_params.get('max_prep_time')

        queryset = MenuItem.objects.all().order_by('created_at')

        if max_prep_time and max_prep_time.isdigit():
            queryset = queryset.filter(estimated_prep_time__lte=int(max_prep_time))

        serializer = MenuItemSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

    def post(self, request):
        """
        Create a new menu item.
        """
        serializer = MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class MenutiemDetailAPIView(APIView):
    """
    API view to retrieve, update, or delete a menu item.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.CHEF,
                EmployeeRole.RoleChoices.WAITER
            ]

        else:
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER
            ]
        return super().get_permissions()
    

    def get_object(self, pk):
        return get_object_or_404(MenuItem, pk=pk)
    

    def get(self, request, pk):
        """
        Retrieve a menu item by ID.
        """
        menu_item = self.get_object(pk)
        serializer = MenuItemSerializer(menu_item)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

    def patch(self, request, pk):
        """
        Update a menu item by ID.
        """
        menu_item = self.get_object(pk)
        serializer = MenuItemSerializer(menu_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request, pk):
        """
        Delete a menu item by ID.
        """
        menu_item = self.get_object(pk)
        menu_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


class MenuItemIngredientListCreateAPIView(APIView):
    """
    API view to list and create menu item ingredients.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.CHEF
            ]
        else:
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
            ]
        return super().get_permissions()
    
    def get(self, request):
        """
        List all menu item ingredients.
        """
        menu_item_id = request.query_params.get('menu_item_id')
        queryset = MenuItemIngredient.objects.all().order_by('created_at')
        if menu_item_id:
            queryset = queryset.filter(menu_item_id=menu_item_id)
        serializer = MenuItemIngredientSerializer(queryset, many=True)  
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        Create a new menu item ingredient.
        """
        serializer = MenuItemIngredientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class MenuItemIngredientDetailAPIView(APIView):
    """
    API view to retrieve, update, or delete a menu item ingredient.
    """

    permission_classes = [RequiresRole]
    
    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.CHEF
            ]
        else:
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER
            ]

        return super().get_permissions()
    
    def get_object(self, pk):
        return get_object_or_404(MenuItemIngredient, pk=pk)
    
    def get(self, request, pk):
        """
        Retrieve a menu item ingredient by ID.
        """
        menu_item_ingredient = self.get_object(pk)
        serializer = MenuItemIngredientSerializer(menu_item_ingredient)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        """
        Update a menu item ingredient by ID.
        """
        menu_item_ingredient = self.get_object(pk)
        serializer = MenuItemIngredientSerializer(menu_item_ingredient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """
        Delete a menu item ingredient by ID.
        """
        menu_item_ingredient = self.get_object(pk)
        menu_item_ingredient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


class DiningTableListCreateAPIView(APIView):
    """
    API view to list and create dining tables.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.WAITER
            ]

        else:
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER
            ]

        return super().get_permissions()
    

    def get(self, request):
        """
        List all dining tables.
        """
        
        min_capacity = request.query_params.get('min_capacity')        
        queryset = DiningTable.objects.filter(is_available=True).order_by('created_at')

        if min_capacity and min_capacity.isdigit():
            queryset = queryset.filter(total_seats__gte=int(min_capacity))
        serializer = DiningTableSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        Create a new dining table.
        """
        serializer = DiningTableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DiningTableDetailAPIView(APIView):
    """
    API view to retrieve, update, or delete a dining table.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.WAITER
            ]
        else:
            self.required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER
            ]
        return super().get_permissions()
    
    def get_object(self, pk):
        return get_object_or_404(DiningTable, pk=pk)
    
    def get(self, request, pk):
        """
        Retrieve a dining table by ID.
        """
        dining_table = self.get_object(pk)
        serializer = DiningTableSerializer(dining_table)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        """
        Update a dining table by ID.
        """
        dining_table = self.get_object(pk)
        if 'is_available' in request.data:
            return Response({"error": "Cannot update availability status through this endpoint."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = DiningTableSerializer(dining_table, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """
        Delete a dining table by ID.
        """
        dining_table = self.get_object(pk)
        if not dining_table.is_available:
            return Response({"error": "Cannot delete a dining table that is currently occupied."}, status=status.HTTP_400_BAD_REQUEST)
        dining_table.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class DiningTableAvailabilityAPIView(APIView):
    """
    API view to update the availability status of a dining table.
    """
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER
    ]

    def patch(self, request, pk):
        dining_table = get_object_or_404(DiningTable, pk=pk)

        # Toggle logic 🔥
        dining_table.is_available = not dining_table.is_available
        dining_table.save()

        serializer = DiningTableSerializer(dining_table)

        return Response({
            "message": "Availability toggled successfully.",
            "is_available": dining_table.is_available,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
