from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    """
    Transforms Customer model instances into JSON payloads and validates incoming structural data.
    """
    id = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'phone_no', 
            'first_name',
            'last_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        # read_only_fields = ['id']
