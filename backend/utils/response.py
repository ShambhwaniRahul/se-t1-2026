# utils/response.py
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

def standard_response(message="Success", success=True, data=None, status_code=200):
    """Utility function to create a standardized success response."""
    return Response({
        "success": success,
        "message": message,
        "data": data,
    }, status=status_code)

def paginated_response(queryset, request, serializer_class, message="Data retrieved successfully.", default_size=10):
    """
    Handles dynamic database pagination and wraps output in the standard_response format.
    Accepts a 'size' query parameter. If size is '-1', pagination is bypassed.
    """
    size_param = request.query_params.get('size', default_size)
    
    try:
        size = int(size_param)
    except ValueError:
        size = default_size

    if size == -1:
        serializer = serializer_class(queryset, many=True)
        payload = {
            'count': queryset.count(),
            'next': None,
            'previous': None,
            'results': serializer.data
        }
        return standard_response(message=message, data=payload)

    paginator = PageNumberPagination()
    paginator.page_size = size
    
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(paginated_queryset, many=True)
    
    # Inject total_pages into the metadata dictionary
    payload = {
        'count': paginator.page.paginator.count,
        'total_pages': paginator.page.paginator.num_pages,
        'next': paginator.get_next_link(),
        'previous': paginator.get_previous_link(),
        'results': serializer.data
    }
    
    return standard_response(message=message, data=payload)