from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import RequiresRole
from .models import PerishableSKU 
from .serializers import PerishableSKUSerializer
from humanresources.models import Employee

# Create your views here.
class PerishableSKUListCreateAPIView(APIView):
    
    required_roles = [
        Employee.RoleChoices.MANAGER,
        Employee.RoleChoices.OWNER,
        Employee.RoleChoices.INVENTORY_MANAGER,
        # Employee.RoleChoices.CHEF  # Chef allowed but restricted in POST
    ]

    permission_classes = [RequiresRole]

    def get(self, request):
        skus = PerishableSKU.objects.all()
        serializer = PerishableSKUSerializer(skus, many=True)
        # Besides those in our required roles, chef is given the permission to Read it. 
        if request.user.role in self.required_roles or request.user.role == Employee.RoleChoices.CHEF:
           return Response(serializer.data)
        return Response(
            {"error": "You do not have permission to perform this action"},
            status=status.HTTP_403_FORBIDDEN
        )

    def post(self, request):
        # A simple check for permission as per our list
        if request.user.role not in self.required_roles:
            return Response(
                {"error": "You do not have permission to perform this action"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PerishableSKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    def patch(self,request,pk):
        # A simple check for permission as per our list
        if request.user.role not in self.required_roles:
            return Response(
                {"error": "You do not have permission to perform this action"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            perishable_sku = PerishableSKU.objects.get(pk=pk)
        except PerishableSKU.DoesNotExist:
            return Response({"error": "Perishable SKU not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PerishableSKUSerializer(perishable_sku, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        if request.user.role not in self.required_roles:
            return Response(
                {"error": "You do not have permission to perform this action"},
                status=status.HTTP_403_FORBIDDEN
            )
         
        try:
           perishable_sku = PerishableSKU.objects.get(pk=pk)
        except PerishableSKU.DoesNotExist:
            return Response({"error": "Perishable SKU not found"}, status=status.HTTP_404_NOT_FOUND)
        
        perishable_sku.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)   