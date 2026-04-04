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
    OrderSerializer,
    OrderMenuItemSerializer,
    OrderMenuItemCreateSerializer)
from logs.models import MenuItemStatusLog

from humanresources.models import EmployeeRole
from django.shortcuts import get_object_or_404
from utils.response import standard_response
from utils.Pricing import get_current_price

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
    
        if not queryset.exists():
            return standard_response(
                success=False,
                message="No menu items found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
    
        serializer = MenuItemSerializer(queryset, many=True)
    
        return standard_response(
            success=True,
            message="Menu items retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    

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
        return get_object_or_404(MenuItem, pk=pk)
    

    def get(self, request, pk):
        """
        Retrieve a menu item by ID.
        """
        menu_item = self.get_object(pk)
        serializer = MenuItemSerializer(menu_item)

        if not serializer.data:
            return standard_response(
                success=False,
                message="No such menu item exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return standard_response(
            success=True,
            message="Menu item retrieved successfully.",
            data=serializer.data
        )
    

    def patch(self, request, pk):
        """
        Update a menu item by ID.
        """
        menu_item = self.get_object(pk)
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
        if not menu_item:
            return standard_response(
                success=False,
                message="No such menu item exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        menu_item.delete()
        return standard_response(
            success=True, 
            message="Menu item deleted successfully.",
            status=status.HTTP_204_NO_CONTENT
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

        if not queryset.exists():
            return standard_response(
                success=False,
                message="No dining tables found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        

        return standard_response(
            success=True,
            message="Dining tables retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK)
    
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
        return get_object_or_404(DiningTable, pk=pk)
    
    def get(self, request, pk):
        """
        Retrieve a dining table by ID.
        """
        dining_table = self.get_object(pk)
        serializer = DiningTableSerializer(dining_table)

        if not serializer.data:
            return standard_response(
                success=False,
                message="No such dining table exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return standard_response(
            success=True,
            message="Dining table retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def patch(self, request, pk):
        """
        Update a dining table by ID.
        """
        dining_table = self.get_object(pk)
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
        if not dining_table.is_available:
            return standard_response(
                success=False,
                message="Cannot delete a dining table that is currently occupied.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        dining_table.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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

    def patch(self, request, pk):
        dining_table = get_object_or_404(DiningTable, pk=pk)

        dining_table.is_available = not dining_table.is_available
        dining_table.save()

        serializer = DiningTableSerializer(dining_table)

        return standard_response(
            success=True, 
            message= "Availability toggled successfully.",
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
        return get_object_or_404(Discounts, pk=pk)
    

    def get(self, request, pk):
        """
        Retrieve a discount by ID.
        """
        discount = self.get_object(pk)
        serializer = DiscountsSerializer(discount)

        if not serializer.data:
            return standard_response(
                success=False,
                message="No such discount exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return standard_response(
            success=True,
            message="Discount retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    

    def patch(self, request, pk):
        return standard_response(
            success=False,
            message="Updating discounts is not allowed. Create a new discount instead.",
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def delete(self, request, pk):
        """To delete a discount by ID."""
        discount = self.get_object(pk)
        if not discount:
            return standard_response(
                success=False,
                message="No such discount exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        discount.delete()
        return standard_response(
            success=True,
            message="Discount deleted successfully.",
            status_code=status.HTTP_204_NO_CONTENT
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


    def get(self, request):
        """List all orders."""
        order_status = request.query_params.get('status')
        queryset = Order.objects.all().order_by('-created_at')
        
        if order_status and order_status.strip().isnumeric():
            queryset = queryset.filter(status=int(order_status))
        
        serializer = OrderSerializer(queryset, many=True)
        if not queryset.exists():
            return standard_response(
                success=False,
                message="No orders found.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        return standard_response(
            success=True,
            message="Orders retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )    
 

    def post(self, request):
        """Create a new order, and, it must have menu items in it.
        Input data format:
        {
            "table": 1,
            "dining_type": 0,
            "packaging_cost": 0
            "items": [
                {
                    "menu_item": 1,
                    "special_instructions": "Less spicy",
                    "price_at_time": 250
                },
                {
                    "menu_item": 2,
                    "special_instructions": "",
                    "price_at_time": 150
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

        serializer = OrderSerializer(data=request.data)
    
        if not serializer.is_valid():
            return standard_response(
                success=False,
                message="Invalid data.",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        validated_data = serializer.validated_data
        items_data = validated_data.pop('items')
    
        # Create Order
        order = Order.objects.create(**validated_data)
    
        total = 0
    
        # Create OrderMenuItems
        for item in items_data:
            menu_item_obj = MenuItem.objects.get(id=item['menu_item'])
    
            # Compute price dynamically
            price = get_current_price(menu_item_obj)
    
            order_item = OrderMenuItem.objects.create(
                order=order,
                menu_item=menu_item_obj,
                special_instructions=item.get('special_instructions', ''),
                price_at_time=price
            )
    
            total += price
    
        # Add packaging cost
        total += order.packaging_cost
    
        # Freeze total
        order.final_total = total
        order.save()
    
        # Response
        response_serializer = OrderSerializer(order)
    
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
        else:
            required_roles = [
                        EmployeeRole.RoleChoices.OWNER,
                        EmployeeRole.RoleChoices.MANAGER,
                        EmployeeRole.RoleChoices.WAITER
                    ]

        return super().get_permissions()


    def get_object(self, pk):
        return get_object_or_404(Order, pk=pk)
    
    def get(self, request, pk):
        """Retrieve an order by ID."""
        order = self.get_object(pk)
        serializer = OrderSerializer(order)

        if not serializer.data:
            return standard_response(
                success=False,
                message="No such order exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return standard_response(
            success=True,
            message="Order retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    def patch(self, request, pk):
        """Update an order by ID."""
        order = self.get_object(pk)
        serializer = OrderSerializer(order, data=request.data, partial=True)
        
        if request.data.get('status') and int(request.data.get('status')) is not 1:
            return standard_response(
                success=False,
                message="Invalid status value.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if serializer.is_valid():
            serializer.save()
            return standard_response(
                success=True,
                message="Order updated successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        return standard_response(
            success=False,
            message="Error updating order.",
            data=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class AddItemsToOrderAPIView(APIView):
    """
    Add more items to an existing OPEN order.
    """

    def post(self, request, pk):
        """
        pk = order_id
        """

        order = get_object_or_404(Order, pk=pk)

        # 1. Check order status
        if order.status != Order.StatusChoices.OPEN:
            return standard_response(
                success=False,
                message="Cannot add items to a closed order.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        items = request.data.get('items', [])

        # 2. Basic validation
        if not items:
            return standard_response(
                success=False,
                message="Items list cannot be empty.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        item_ids = [item.get('menu_item') for item in items]

        # 3. Duplicate check (within request)
        if len(item_ids) != len(set(item_ids)):
            return standard_response(
                success=False,
                message="Duplicate menu items not allowed in same request.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # 4. Check all menu items exist
        existing_items = set(
            MenuItem.objects.filter(id__in=item_ids).values_list('id', flat=True)
        )

        invalid_items = [i for i in item_ids if i not in existing_items]

        if invalid_items:
            return standard_response(
                success=False,
                message=f"Invalid menu_item IDs: {invalid_items}",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # 5. Create items
        added_total = 0

        for item in items:
            menu_item_obj = MenuItem.objects.get(id=item['menu_item'])

            price = get_current_price(menu_item_obj)

            OrderMenuItem.objects.create(
                order=order,
                menu_item=menu_item_obj,
                special_instructions=item.get('special_instructions', ''),
                price_at_time=price
            )

            added_total += price

        # 6. Update order total
        order.final_total = (order.final_total or 0) + added_total
        order.save()

        return standard_response(
            success=True,
            message="Items added to order successfully.",
            data={
                "order_id": order.id,
                "added_amount": added_total,
                "new_total": order.final_total
            },
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

    def get(self, request,order_id):
        """List all items in a particular order."""
        order = get_object_or_404(Order, pk=order_id)
        if not order:
            return standard_response(
                success=False,
                message="No such order exists.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = OrderMenuItemSerializer(order.ordermenuitem_set.all(), many=True)

        return standard_response(
            success=True,
            message="Order items retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
            )


class OrderMenuItemDetailAPIView(APIView):
    """To retrieve, update or delete an order item."""
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
        
    def get_object(self, pk):
        return get_object_or_404(OrderMenuItem, pk=pk)
    
    def get(self, request, pk):
        order_item = self.get_object(pk)
        serializer = OrderMenuItemSerializer(order_item)
        return standard_response(
            success=True,
            message="Order item retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    

    def delete(self, request, pk):
        order_item = self.get_object(pk)
        
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
            status_code=status.HTTP_204_NO_CONTENT
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

    def patch(self, request, pk):
        order_item = get_object_or_404(OrderMenuItem, pk=pk)
        old_status = order_item.menu_item_status
        new_status = request.data.get('menu_item_status')
    
        if new_status is None:
            return standard_response(
                success=False,
                message="menu_item_status is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        if int(new_status) not in [status.value for status in OrderMenuItem.StatusChoices]:
            return standard_response(
                success=False,
                message="Invalid menu_item_status value.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        new_status = int(new_status)  # normalizing the value once
    
        # Role checks (optimize - avoid repeating queries)
        is_chef = EmployeeRole.objects.filter(
            employee=request.user.employee,
            role=EmployeeRole.RoleChoices.CHEF
        ).exists()
    
        is_waiter = EmployeeRole.objects.filter(
            employee=request.user.employee,
            role=EmployeeRole.RoleChoices.WAITER
        ).exists()
    
        # Transition Rules
        valid_transition = False
    
        if (
            order_item.menu_item_status == OrderMenuItem.StatusChoices.PENDING and
            new_status == OrderMenuItem.StatusChoices.IN_PROGRESS and
            is_chef
        ):
            valid_transition = True
    
        elif (
            order_item.menu_item_status == OrderMenuItem.StatusChoices.IN_PROGRESS and
            new_status == OrderMenuItem.StatusChoices.READY_TO_SERVE and
            is_chef
        ):
            valid_transition = True
    
        elif (
            order_item.menu_item_status == OrderMenuItem.StatusChoices.READY_TO_SERVE and
            new_status == OrderMenuItem.StatusChoices.SERVED and
            is_waiter
        ):
            valid_transition = True
    
        if not valid_transition:
            return standard_response(
                success=False,
                message="Invalid status transition.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
        # UPDATE STATUS
        order_item.menu_item_status = new_status
        order_item.save()
    
        # LOG CREATION
        MenuItemStatusLog.objects.create(
            order_menu_item=order_item,
            status=new_status
        )
    
        return standard_response(
            success=True,
            message=f"Order item status updated successfully from {old_status} to {order_item.menu_item_status}.",
            data={
                "order_item_id": order_item.id,
                "old_status": old_status,
                "new_status": order_item.menu_item_status
            },
            status_code=status.HTTP_200_OK
        )
    