from rest_framework.response import Response


def standard_response(message="Success",success=True, data=None, status_code=200):
    """Utility function to create a standardized success response."""
    return Response({
        "success":success,
        "message": message,
        "data": data,
    }, status=status_code)