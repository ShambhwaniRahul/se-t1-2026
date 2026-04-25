from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import RequiresRole
from .models import MenuItem, MenuItemIngredient, DiningTable, Order, OrderMenuItem, Discounts
from .serializers import (
    MenuItemSerializer, MenuItemIngredientSerializer,
    DiningTableSerializer,
    DiscountsSerializer,
    OrderReadSerializer,
    OrderCreateSerializer,
    OrderMenuItemSerializer,
    OrderMenuItemCreateSerializer,
    UpdateOrderMenuItemStatusSerializer,
    AddItemsToOrderSerializer)
from logs.models import MenuItemStatusLog

from humanresources.models import EmployeeRole
from django.shortcuts import get_object_or_404
from utils.response import standard_response
from utils.Pricing import get_current_price
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

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
    

    @extend_schema(responses=MenuItemSerializer,
            parameters=[
                OpenApiParameter(
                    name="max_prep_time",
                    type=OpenApiTypes.INT,
                    description="Maximum preparation time (in minutes) for menu items.",
                    required=False
                ),
                OpenApiParameter(
                    name="category",
                    type=OpenApiTypes.INT,
                    description="Category of the menu item. Enter one of the following numbers: STARTER = 0, MAIN_COURSE = 1,DESSERT = 2,BEVERAGE = 3",
                ),
                OpenApiParameter(
                  name="is_veg",
                  type=OpenApiTypes.BOOL,
                  description="Whether the menu item is vegetarian or not. Enter true or false.",  
                )
            ])
    def get(self, request):
        """
        List all menu items.
        """
    
        max_prep_time = request.query_params.get('max_prep_time')
        category = request.query_params.get('category')
        is_veg = request.query_params.get('is_veg')
    
        queryset = MenuItem.objects.all().order_by('-created_at')
    
        if max_prep_time and max_prep_time.strip().isnumeric():
            queryset = queryset.filter(
                estimated_prep_time__lte=int(max_prep_time)
            )

        if category and category.strip().isnumeric():
            queryset = queryset.filter(category=int(category))

        if is_veg and is_veg.lower() in ['true', 'false']:
            queryset = queryset.filter(is_veg=is_veg.lower() == 'true')
    
   
        serializer = MenuItemSerializer(queryset, many=True)
    
        return standard_response(
            success=True,
            message="Menu items retrieved successfully." if len(queryset)>0 else "No menu items found for the given Parameters.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    
    
    @extend_schema(request=MenuItemSerializer)
    def post(self, request):
        """
        Create a new menu item.
        """
        serializer = MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Menu item created successfully.",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        return standard_response(
            success=False,
            message="Error creating menu item.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

class MenuItemDetailAPIView(APIView):
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
        try:
            return MenuItem.objects.get(pk=pk)
        except MenuItem.DoesNotExist:
            return None
        
    def standard_error_response(self, message="No such menu item exists.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )    
    

    def get(self, request, pk):
        """
        Retrieve a menu item by ID.
        """
        menu_item = self.get_object(pk)

        if menu_item is None:
            return self.standard_error_response()
        serializer = MenuItemSerializer(menu_item)
        
        return standard_response(
            success=True,
            message="Menu item retrieved successfully.",
            data=serializer.data
        )
    
    
    @extend_schema(request=MenuItemSerializer)
    def patch(self, request, pk):
        """
        Update a menu item by ID.
        """
        menu_item = self.get_object(pk)

        if menu_item is None:
            return self.standard_error_response()
        serializer = MenuItemSerializer(menu_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Menu item updated successfully.",
                data=serializer.data
            )
        return standard_response(
            success=False,
            message="Error updating menu item.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        """
        Delete a menu item by ID.
        """
        menu_item = self.get_object(pk)
        if menu_item is None:
            return self.standard_error_response()

        menu_item.delete()
        return standard_response(
            success=True, 
            message="Menu item deleted successfully.",
            status_code=status.HTTP_200_OK
            )
    


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
    

    @extend_schema(responses=MenuItemIngredientSerializer(many=True),
                   parameters=[
                       OpenApiParameter(name="menu_item_id",
                                type=OpenApiTypes.INT,
                                description="ID of the menu item",
                                required=False)
                   ])
    def get(self, request):
        """
        List all menu item ingredients.
        """
        menu_item_id = request.query_params.get('menu_item_id')
        queryset = MenuItemIngredient.objects.all().order_by('created_at')
        if menu_item_id:
            queryset = queryset.filter(menu_item_id=menu_item_id)
        serializer = MenuItemIngredientSerializer(queryset, many=True)

        if not queryset.exists():
            return standard_response(
                success=False,
                message="No menu item ingredients found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return standard_response(
            success=True,
            message="Menu item ingredients retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK)
    
    @extend_schema(request=MenuItemIngredientSerializer)
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
        try:
            return MenuItemIngredient.objects.get(pk=pk)
        except MenuItemIngredient.DoesNotExist:
            return None
        
    def standard_error_response(self, message="No such menu item ingredient exists.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )
    
    def get(self, request, pk):
        """
        Retrieve a menu item ingredient by ID.
        """
        menu_item_ingredient = self.get_object(pk)
        if menu_item_ingredient is None:
            return self.standard_error_response()
        serializer = MenuItemIngredientSerializer(menu_item_ingredient)
        return standard_response(
            success=True,
            message="Menu item ingredient retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    @extend_schema(request=MenuItemIngredientSerializer)
    def patch(self, request, pk):
        """
        Update a menu item ingredient by ID.
        """
        menu_item_ingredient = self.get_object(pk)
        if menu_item_ingredient is None:
            return self.standard_error_response()
        serializer = MenuItemIngredientSerializer(menu_item_ingredient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Menu item ingredient updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        return standard_response(
            success=False,
            message="Error updating menu item ingredient.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        """
        Delete a menu item ingredient by ID.
        """
        menu_item_ingredient = self.get_object(pk)
        if menu_item_ingredient is None:
            return self.standard_error_response()
        menu_item_ingredient.delete()
        return standard_response(
            success=True,
            message="Menu item ingredient deleted successfully.",
            status_code=status.HTTP_200_OK
        )


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
    

    @extend_schema(responses=DiningTableSerializer,
                   parameters=[
                       OpenApiParameter(
                           name="min_capacity",
                           type=OpenApiTypes.INT,
                           description="Minimum capacity of dining tables to retrieve.",
                       ),
                       OpenApiParameter(
                           name="is_available",
                           type=OpenApiTypes.STR,
                           description="Availability of dining tables to retrieve. Enter only yes",

                       )
                   ]) 
    def get(self, request):
        """
        List all dining tables.
        """
        
        min_capacity = request.query_params.get('min_capacity') 
        is_available = request.query_params.get('is_available')       
        queryset = DiningTable.objects.filter().order_by('created_at')

        if min_capacity and min_capacity.isdigit():
            queryset = queryset.filter(total_seats__gte=int(min_capacity))

        if is_available:
            if is_available.lower() == 'yes':
                queryset = queryset.filter(is_available=True)
        
        serializer = DiningTableSerializer(queryset, many=True)     

        return standard_response(
            success=True,
            message="Dining tables retrieved successfully." if len(queryset)>0 else "No dining tables found with the given parameters.",
            data=serializer.data,
            status_code=status.HTTP_200_OK)
    
    @extend_schema(request=DiningTableSerializer)
    def post(self, request):
        """
        Create a new dining table.
        """
        serializer = DiningTableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Dining table created successfully.",
                data=serializer.data,
                status_code=status.HTTP_201_CREATED)
        return standard_response(
            success=False,
            message="Error creating dining table.",
            status_code=status.HTTP_400_BAD_REQUEST
            )
    

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
        try:
            return DiningTable.objects.get(pk=pk)
        except DiningTable.DoesNotExist:
            return None
        
    def standard_error_response(self, message="No such dining table exists.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )
    
    @extend_schema(responses=DiningTableSerializer)
    def get(self, request, pk):
        """
        Retrieve a dining table by ID.
        """
        dining_table = self.get_object(pk)
        if dining_table is None:
            return self.standard_error_response()
        serializer = DiningTableSerializer(dining_table)
        return standard_response(
            success=True,
            message="Dining table retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @extend_schema(request=DiningTableSerializer)
    def patch(self, request, pk):
        """
        Update a dining table by ID.
        """
        dining_table = self.get_object(pk)
        if dining_table is None:
            return self.standard_error_response()
        
        if 'is_available' in request.data:
            return standard_response(
                success=False,
                message="Cannot update availability status through this endpoint.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        serializer = DiningTableSerializer(dining_table, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Dining table updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        return standard_response(
            success=False,
            message="Error updating dining table.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        """
        Delete a dining table by ID.
        """
        dining_table = self.get_object(pk)

        if dining_table is None:
            return self.standard_error_response()
        if not dining_table.is_available:
            table_number = dining_table.table_number
            return standard_response(
                success=False,
                message="Cannot delete a dining table that is currently occupied.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        dining_table.delete()
        return standard_response(success=True, message=f"Table number {table_number} deleted successfully.", status=status.HTTP_200_OK)
    

class ToggleDiningTableAvailabilityAPIView(APIView):
    """
    API view to update the availability status of a dining table.
    """
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER
    ]

    def get_table(self, pk):
        try:
            return DiningTable.objects.get(pk=pk)
        except DiningTable.DoesNotExist:
            return None
 
    def patch(self, request, pk):
        """Enter the id of the dining table to toggle its availability."""
        dining_table = self.get_table(pk)

        if dining_table is None:
            return standard_response(
                success=False,
                message="No such dining table exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        dining_table.is_available = not dining_table.is_available
        dining_table.save()

        serializer = DiningTableSerializer(dining_table)

        return standard_response(
            success=True, 
            message= f"Table number {dining_table.table_number} is now occupied." if not dining_table.is_available else f"Table Number {dining_table.table_number} is now Available.",
            data=serializer.data,
            status_code=status.HTTP_200_OK)



class DiscountsListCreateAPIView(APIView):
    """
    API view to list and create discounts for menu items.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            required_roles = [
                        EmployeeRole.RoleChoices.OWNER,
                        EmployeeRole.RoleChoices.MANAGER,
                        EmployeeRole.RoleChoices.WAITER
                    ]
        else:
            required_roles = [
                        EmployeeRole.RoleChoices.OWNER,
                        EmployeeRole.RoleChoices.MANAGER
                    ]
        return super().get_permissions()        
    

    @extend_schema(responses=DiscountsSerializer,
            parameters=[
              OpenApiParameter(
                name='menu_item_id',
                type=OpenApiTypes.INT,
                description='Enter the id of the menu item to filter discounts by menu item ID.',
                required=False
              ),
              OpenApiParameter(
                  name="min_discount",
                  type=OpenApiTypes.FLOAT,
                  description="Enter the minimum discount percent to filter discounts by.",
                  required=False
              ),
              OpenApiParameter(
                  name="max_discount",
                  type=OpenApiTypes.FLOAT,
                  description="Enter the maximum discount percent to filter discounts by.",
              ),
              OpenApiParameter(
                  name="min_validity",
                  type=OpenApiTypes.INT,
                  description="Enter the minimum validity in days to filter discounts by.",
                  required=False
              ),
              OpenApiParameter(
                  name="max_validity",
                  type=OpenApiTypes.INT,
                  description="Enter the maximum validity in days to filter discounts by.",
                  required=False
              )
            ])
    def get(self, request):
        """
        List all discounts.
        """
        menu_item_id = request.query_params.get('menu_item_id')
        min_discount = request.query_params.get('min_discount')
        max_discount = request.query_params.get('max_discount')
        min_validity = request.query_params.get('min_validity')
        max_validity = request.query_params.get('max_validity')


        queryset = Discounts.objects.all().order_by('-created_at')


        if menu_item_id and menu_item_id.strip().isnumeric():
            queryset = queryset.filter(menu_item_id=int(menu_item_id))
        if min_discount and min_discount.strip().replace('.','',1).isdigit():
            queryset = queryset.filter(rate__gte=float(min_discount))
        if max_discount and max_discount.strip().replace('.','',1).isdigit():    
            queryset = queryset.filter(rate__lte=float(max_discount))
        if min_validity and min_validity.strip().isdigit():
            queryset = queryset.filter(validity__gte=int(min_validity))
        if max_validity and max_validity.strip().isdigit():
            queryset = queryset.filter(validity__lte=int(max_validity))


        serializer = DiscountsSerializer(queryset, many=True)

        if not queryset.exists():
            return standard_response(
                success=False,
                message="No discounts found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        if (min_discount is not None and float(min_discount) > 1) or (max_discount is not None and float(max_discount) > 1):
            return standard_response(
                success=False,
                message="Invalid discount range",
                status_code=400
            )

        return standard_response(
            success=True,
            message="Discounts retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK)
    
    @extend_schema(request=DiscountsSerializer)
    def post(self, request):
        """
        Create discounts for multiple menu items.
        It will get the input data in the following format:
        {
            "rate": 0.2,
            "validity": 7,
            "menu_items": [1, 2, 3]
        }

        The data will be saved as follows:
        {menu_item :1, rate:0.2, validity:7},
        {menu_item :2, rate:0.2, validity:7},
        {menu_item :3, rate:0.2, validity:7}
        """      

        rate = request.data.get('rate')
        validity = request.data.get('validity')
        menu_items = request.data.get('menu_items', [])
    
        #  Basic validation
        if rate is None or validity is None or not menu_items:
            return standard_response(
                success=False,
                message="rate, validity and menu_items are required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        #  Validate using serializer (for rate & validity rules)
        temp_serializer = DiscountsSerializer(data={
            "rate": rate,
            "validity": validity,
            "menu_item": menu_items[0]  # dummy for validation
        })
    
        if not temp_serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid discount data. Cannot create discounts.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        created_discounts = []
    
        # Imp: Bulk creation loop
        for item_id in menu_items:
            try:
                menu_item = MenuItem.objects.get(id=item_id)
            except MenuItem.DoesNotExist:
                continue  # skip invalid IDs
    
            discount = Discounts.objects.create(
                menu_item=menu_item,
                rate=rate,
                validity=validity
            )
    
            created_discounts.append(discount)
    
        if not created_discounts:
            return standard_response(
                success=False,
                message="No valid menu items found.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        serializer = DiscountsSerializer(created_discounts, many=True)
    
        return standard_response(
            success=True,
            message="Discounts created successfully.",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED
        )


class DiscountsDetailAPIView(APIView):
    """
    API view to retrieve, update, or delete a discount.
    """
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.WAITER
            ]
        else:
            required_roles = [
                        EmployeeRole.RoleChoices.OWNER,
                        EmployeeRole.RoleChoices.MANAGER,
                    ]
    
        return super().get_permissions()

    
    def get_object(self, pk):
        try: 
            return Discounts.objects.git(pk=pk)        
        except Discounts.DoesNotExist:
            return None
        
    def standard_error_response(self, message="No such discount exists.", status_code=status.HTTP_404_NOT_FOUND):
      return standard_response(
          success=False,
          message=message,
          status_code=status.HTTP_404_NOT_FOUND
      )

    def get(self, request, pk):
        """
        Retrieve a discount by ID.
        """
        discount = self.get_object(pk)

        if discount is None:
            return self.standard_error_response()
        
        serializer = DiscountsSerializer(discount)
        return standard_response(
            success=True,
            message="Discount retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    
    @extend_schema(request=DiscountsSerializer)
    def patch(self, request, pk):
        return standard_response(
            success=False,
            message="Updating discounts is not allowed. Create a new discount instead.",
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def delete(self, request, pk):
        """To delete a discount by ID."""
        discount = self.get_object(pk)
        if discount is None:
            return self.standard_error_response()

        
        discount.delete()
        return standard_response(
            success=True,
            message="Discount deleted successfully.",
            status_code=status.HTTP_200_OK
        )
    

class OrderListCreateAPIView(APIView):
    """To create and list orders."""
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.WAITER,
                EmployeeRole.RoleChoices.CHEF
            ]
        else:
            required_roles = [
                        EmployeeRole.RoleChoices.OWNER,
                        EmployeeRole.RoleChoices.MANAGER,
                        EmployeeRole.RoleChoices.WAITER
                    ]

        return super().get_permissions()

    
    @extend_schema(responses=OrderReadSerializer, parameters=[OpenApiParameter('status', OpenApiTypes.INT, description="Status of the order. 0 - Pending, 1 - Completed, 2 - Cancelled")])
    def get(self, request):
        """List all orders."""
        order_status = request.query_params.get('status')
        queryset = Order.objects.all().order_by('-created_at')
        
        if order_status and order_status.strip().isnumeric():
            queryset = queryset.filter(status=int(order_status))
        
        serializer = OrderReadSerializer(queryset, many=True)
        
        return standard_response(
            success=True,
            message="Orders retrieved successfully." if len(queryset)>0 else "No orders found for the given Parameters.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )    


    @extend_schema(request=OrderCreateSerializer, responses=OrderReadSerializer)
    def post(self, request):
        """
        Create a new order, and, it must have menu items in it.
        Input data format:
        {
            "table": 1,
            "dining_type": 0,
            "packaging_cost": 0
            "items": [
                {
                    "menu_item": 1,
                    "special_instructions": "Less spicy",
                },
                {
                    "menu_item": 2,
                    "special_instructions": "",
                }
            ]

        Output data format:
        In the Order Table:
        {
            "id": 1,
            "table": 1,
            "status": 0,
            "dining_type": 0,
            "packaging_cost": 0,
            "order_total": "computed total"
        }    

        In the OrderMenuItem Table:
        [
            {
                "id": 1,
                "order": 1,
                "menu_item": 1,
                "chef": null,
                "menu_item_status": 0,
                "special_instructions": "Less spicy",
                "price_at_time": "price of the menu item at the time of order"
            },
            {
                "id": 2,
                "order": 1,
                "menu_item": 2,
                "item_total": "computed total for this menu item",
                "chef": null,
                "menu_item_status": 0,
                "special_instructions": "",
                "price_at_time": "price of the menu item at the time of order"
            }
        ]
        """
    
        serializer = OrderCreateSerializer(data=request.data)
    
        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        validated_data = serializer.validated_data
        items_data = validated_data.pop('items')
    
        # 🔥 Create Order
        order = Order.objects.create(**validated_data)
    
        # 🔥 Fetch all menu items in ONE query (optimization 🚀)
        item_ids = [item['menu_item'] for item in items_data]
    
        menu_items_map = {
            item.id: item for item in MenuItem.objects.filter(id__in=item_ids)
        }
    
        total = 0
        order_items_to_create = []
    
        # 🔥 Prepare OrderMenuItems
        for item in items_data:
            menu_item_obj = menu_items_map[item['menu_item']]
    
            price = get_current_price(menu_item_obj)
    
            order_items_to_create.append(
                OrderMenuItem(
                    order=order,
                    menu_item=menu_item_obj,
                    special_instructions=item.get('special_instructions', ''),
                    price_at_time=price
                )
            )
    
            total += price
    
        # 🔥 Bulk create (performance boost)
        OrderMenuItem.objects.bulk_create(order_items_to_create)
    
        # 🔥 Add packaging cost
        total += order.packaging_cost
    
        # 🔥 Freeze total
        order.final_total = total
        order.save()

        # Toggling the table availability
        DiningTable.objects.filter(id=order.table.id).update(is_available=False)
    
        # 🔥 Response
        response_serializer = OrderReadSerializer(order)
    
        return standard_response(
            success=True,
            message="Order created successfully.",
            data=response_serializer.data,
            status_code=status.HTTP_201_CREATED
        )



class OrderDetailAPIView(APIView):
    """To retrieve, update or delete an order."""
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.WAITER,
                EmployeeRole.RoleChoices.CHEF
            ]
        elif self.request.method == 'PATCH':
            required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.WAITER
            ]
        else:
            required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER
            ]

        return super().get_permissions()

    def get_object(self, pk):
        try:
            return Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return None

    def standard_error_response(self, message="No such order exists.", status_code=status.HTTP_404_NOT_FOUND):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )

    # ✅ FIXED GET
    def get(self, request, pk):
        """Retrieve an order by ID."""
        order = self.get_object(pk)

        if order is None:
            return self.standard_error_response()

        # 🔥 USE READ SERIALIZER
        serializer = OrderReadSerializer(order)

        return standard_response(
            success=True,
            message="Order retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    # ✅ FIXED PATCH
    @extend_schema(
        request=OrderCreateSerializer,
        responses=OrderReadSerializer
    )
    def patch(self, request, pk):
        """Update an order by ID."""
        order = self.get_object(pk)

        if order is None:
            return self.standard_error_response()

        # 🔥 STATUS VALIDATION (only allow closing)
        if 'status' in request.data and int(request.data.get('status')) != 1:
            return standard_response(
                success=False,
                message="Invalid status value. Only closing (1) is allowed.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # 🔥 SIMPLE FIELD UPDATE (NO items handling here)
        allowed_fields = ['status', 'table', 'dining_type', 'packaging_cost']

        for field in allowed_fields:
            if field in request.data:
                setattr(order, field, request.data[field])

        order.save()

        # 🔥 RESPONSE FIX
        serializer = OrderReadSerializer(order)

        return standard_response(
            success=True,
            message="Order updated successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def delete(self, request, pk):
        """Delete an order by ID with role + status checks."""
    
        order = self.get_object(pk)
    
        if order is None:
            return self.standard_error_response()
    
        # 🔥 Get user roles
        roles = set(
            EmployeeRole.objects.filter(employee=request.user)
            .values_list('role', flat=True)
        )
    
        is_chef = EmployeeRole.RoleChoices.CHEF in roles
        is_manager = EmployeeRole.RoleChoices.MANAGER in roles
        is_owner = EmployeeRole.RoleChoices.OWNER in roles
    
        # 🔥 Check if any item is READY_TO_SERVE or beyond
        critical_statuses = [
            OrderMenuItem.StatusChoices.IN_PROGRESS,
            OrderMenuItem.StatusChoices.READY_TO_SERVE,
            OrderMenuItem.StatusChoices.SERVED,
        ]
    
        has_critical_items = order.items.filter(
            menu_item_status__in=critical_statuses
        ).exists()
    
        # 🔥 Restriction logic
        if has_critical_items and is_chef and not (is_manager or is_owner):
            return standard_response(
                success=False,
                message="Chef cannot cancel order once items are ready or beyond.",
                status_code=status.HTTP_403_FORBIDDEN
            )
    
        # 🔥 DELETE
        order.delete()
    
        return standard_response(
            success=True,
            message="Order deleted successfully.",
            status_code=status.HTTP_200_OK
        )



class AddItemsToOrderAPIView(APIView):
    """
    Add more items to an existing OPEN order.
    """
    permission_classes = [RequiresRole]
    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER
    ]

    @extend_schema(
        request=AddItemsToOrderSerializer,
        responses=OrderReadSerializer
    )
    def post(self, request, pk):
        """
        pk = order_id
        """

        # 🔥 Get order safely
        order = Order.objects.filter(pk=pk).first()

        if order is None:
            return standard_response(
                success=False,
                message="No such order exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # 🔥 Check order status
        if order.status != Order.StatusChoices.OPEN:
            return standard_response(
                success=False,
                message="Cannot add items to a closed order.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # 🔥 Validate request using serializer
        serializer = AddItemsToOrderSerializer(data=request.data)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        validated_items = serializer.validated_data['items']

        item_ids = [item['menu_item'] for item in validated_items]

        # # 🔥 Prevent duplicates already in order
        # existing_order_items = set(
        #     order.items.values_list('menu_item_id', flat=True)
        # )

        # duplicates_in_order = [i for i in item_ids if i in existing_order_items]

        # if duplicates_in_order:
        #     return standard_response(
        #         success=False,
        #         message=f"Items already exist in order: {duplicates_in_order}",
        #         status_code=status.HTTP_400_BAD_REQUEST
        #     )

        # 🔥 Fetch all menu items in one query (optimization 🚀)
        menu_items_map = {
            item.id: item for item in MenuItem.objects.filter(id__in=item_ids)
        }

        # 🔥 Create items
        order_items_to_create = []
        added_total = 0

        for item in validated_items:
            menu_item_obj = menu_items_map[item['menu_item']]

            price = get_current_price(menu_item_obj)

            order_items_to_create.append(
                OrderMenuItem(
                    order=order,
                    menu_item=menu_item_obj,
                    special_instructions=item.get('special_instructions', ''),
                    price_at_time=price
                )
            )

            added_total += price

        # 🔥 Bulk create
        OrderMenuItem.objects.bulk_create(order_items_to_create)

        # 🔥 Update total
        order.final_total = order.order_total
        order.save()

        # 🔥 Response
        response_serializer = OrderReadSerializer(order)

        return standard_response(
            success=True,
            message="Items added to order successfully.",
            data=response_serializer.data,
            status_code=status.HTTP_200_OK
        )


class GetOrdersByDiningTableAPIView(APIView):
    """To get all orders for a particular dining table."""
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER,
    ]

    @extend_schema(responses=OrderReadSerializer(many=True))
    def get(self, request,table_id):
        """Get all orders for a particular dining table."""

        Table = DiningTable.objects.filter(id=table_id).first()

        if Table is None:
            return standard_response(
                success=False,
                message="No such dining table exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        orders = Order.objects.filter(table_id=table_id, status__in=[Order.StatusChoices.OPEN]).order_by('-created_at')
        serializer = OrderReadSerializer(orders, many=True)

        return standard_response(
            success=True,
            message="Orders retrieved successfully." if len(serializer.data)>0 else "No orders found for this dining table.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

     


class OrderMenuItemListAPIView(APIView):
    """To list all items in a particular order."""
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER,
        EmployeeRole.RoleChoices.CHEF
    ]

    def get(self, request, pk):
        """List all items in a particular order."""

        # 🔥 Safe fetch
        order = Order.objects.filter(pk=pk).first()

        if order is None:
            return standard_response(
                success=False,
                message="No such order exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # 🔥 CORRECT RELATION
        serializer = OrderMenuItemSerializer(order.items.all(), many=True)

        return standard_response(
            success=True,
            message="Order items retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )


class AllOrdersMenuItemsListAPIView(APIView):
    """To list all items across all orders which are open."""
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.WAITER,
        EmployeeRole.RoleChoices.CHEF
    ]

    @extend_schema(responses=OrderMenuItemSerializer(many=True))
    def get(self, request):
        """List all items across all open orders."""

        # 🔥 Fetch all open orders
        open_orders = Order.objects.filter(status=Order.StatusChoices.OPEN)

        # 🔥 Fetch all items from these orders
        order_items = OrderMenuItem.objects.filter(order__in=open_orders)

        # 🔥 Serialize the data
        serializer = OrderMenuItemSerializer(order_items, many=True)

        return standard_response(
            success=True,
            message="Order items retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

class OrderMenuItemDetailAPIView(APIView):
    """Retrieve, update or delete a specific item in an order."""
    permission_classes = [RequiresRole]

    def get_permissions(self):
        if self.request.method == 'GET':
            required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER,
                EmployeeRole.RoleChoices.WAITER,
                EmployeeRole.RoleChoices.CHEF
            ]
        else:
            required_roles = [
                EmployeeRole.RoleChoices.OWNER,
                EmployeeRole.RoleChoices.MANAGER
            ]

        return super().get_permissions()

    # 🔥 FIXED: correct lookup using OrderMenuItem ID
    def get_object(self, order_id, item_id):
        return OrderMenuItem.objects.filter(
            id=item_id,          # ✅ correct
            order_id=order_id    # ✅ safety check
        ).first()

    def standard_error_response(
        self,
        message="No such order item exists.",
        status_code=status.HTTP_404_NOT_FOUND
    ):
        return standard_response(
            success=False,
            message=message,
            status_code=status_code
        )

    def get(self, request, order_id, item_id):
        """
        order_id = Order ID
        item_id = OrderMenuItem ID
        """

        order_item = self.get_object(order_id, item_id)

        if order_item is None:
            return self.standard_error_response()

        serializer = OrderMenuItemSerializer(order_item)

        return standard_response(
            success=True,
            message="Order item retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )


    def delete(self, request, pk):
        order_item = self.get_object(pk)

        if order_item is None:
            return self.standard_error_response()
        
        if order_item.menu_item_status != OrderMenuItem.StatusChoices.PENDING:
            return standard_response(
                success=False,
                message="Only items that are pending can be deleted.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        order_item.delete()

        return standard_response(
            success=True,
            message="Order item deleted successfully.",
            status_code=status.HTTP_200_OK
        )


class UpdateOrderMenuItemStatusAPIView(APIView):
    """To update the status of an order item."""
    permission_classes = [RequiresRole]

    required_roles = [
        EmployeeRole.RoleChoices.OWNER,
        EmployeeRole.RoleChoices.MANAGER,
        EmployeeRole.RoleChoices.CHEF,
        EmployeeRole.RoleChoices.WAITER
    ]
    
    @extend_schema(request=UpdateOrderMenuItemStatusSerializer)
    def patch(self, request, pk):

        # 🔥 Safe fetch
        order_item = OrderMenuItem.objects.filter(pk=pk).first()

        if order_item is None:
            return standard_response(
                success=False,
                message="No such order item exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # 🔥 Serializer validation
        serializer = UpdateOrderMenuItemStatusSerializer(data=request.data)

        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        new_status = serializer.validated_data['menu_item_status']
        old_status = order_item.menu_item_status

        # 🔥 Role checks
        is_chef = EmployeeRole.objects.filter(
            employee=request.user,
            role=EmployeeRole.RoleChoices.CHEF
        ).exists()

        is_waiter = EmployeeRole.objects.filter(
            employee=request.user,
            role=EmployeeRole.RoleChoices.WAITER
        ).exists()

        # 🔥 Transition Rules
        valid_transition = False

        if (
            old_status == OrderMenuItem.StatusChoices.PENDING and
            new_status == OrderMenuItem.StatusChoices.IN_PROGRESS and
            not is_waiter
        ):
            valid_transition = True

        elif (
            old_status == OrderMenuItem.StatusChoices.IN_PROGRESS and
            new_status == OrderMenuItem.StatusChoices.READY_TO_SERVE and
            not is_waiter
        ):
            valid_transition = True

        elif (
            old_status == OrderMenuItem.StatusChoices.READY_TO_SERVE and
            new_status == OrderMenuItem.StatusChoices.SERVED 
            # and not is_chef
        ):
            valid_transition = True

        # if not is_chef and not is_waiter:
        #     return standard_response(
        #         success=False,
        #         message="Only a Chef or Waiter can update the status of an order item!",
        #         status_code=status.HTTP_403_FORBIDDEN
        #     )    

        if not valid_transition:
            return standard_response(
                success=False,
                message="Invalid status transition.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # 🔥 UPDATE
        if new_status == OrderMenuItem.StatusChoices.IN_PROGRESS:
            order_item.chef = request.user

        order_item.menu_item_status = new_status
        order_item.save()

        # 🔥 LOG
        MenuItemStatusLog.objects.create(
            order_menu_item=order_item,
            status=new_status
        )

        # 🔥 RESPONSE (clean + consistent)
        response_serializer = UpdateOrderMenuItemStatusSerializer(order_item)

        return standard_response(
            success=True,
            message="Order item status updated successfully.",
            data=response_serializer.data,
            status_code=status.HTTP_200_OK
        )
