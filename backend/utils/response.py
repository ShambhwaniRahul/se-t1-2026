from rest_framework.response import Response

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

def standard_response(message="Success", success=True, data=None, status_code=200):
    """
    Core utility function to create a standardized JSON response envelope.
    """
    return Response({
        "success": success,
        "message": message,
        "data": data,
    }, status=status_code)


def paginated_response(queryset, request, serializer_class, message="Data retrieved successfully.", default_size=10):
    """
    Intercepts standard querysets, applies dynamic pagination based on request parameters,
    and wraps the serialized output in the standard_response format.
    Bypasses pagination and returns the full dataset if 'size' is set to '-1'.
    """
    # Extract 'size' parameter from URL, falling back to the configured default
    size_param = request.query_params.get('size', default_size)
    
    # Ensure parameter integrity; fallback to default if frontend passes invalid strings
    try:
        size = int(size_param)
    except ValueError:
        size = default_size

    # Bypass Logic: -1 returns the complete dataset unpaginated
    if size == -1:
        serializer = serializer_class(queryset, many=True)
        payload = {
            'count': queryset.count(),
            'next': None,
            'previous': None,
            'results': serializer.data
        }
        return standard_response(message=message, data=payload)

    # Standard DRF Pagination logic
    paginator = PageNumberPagination()
    paginator.page_size = size
    
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(paginated_queryset, many=True)
    
    payload = {
        'count': paginator.page.paginator.count,
        'next': paginator.get_next_link(),
        'previous': paginator.get_previous_link(),
        'results': serializer.data
    }
    
    return standard_response(message=message, data=payload)