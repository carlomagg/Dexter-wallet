from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Custom exception handler for better API error responses."""
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, there was an unhandled exception
    if response is None:
        logger.error(f"Unhandled exception: {str(exc)}")
        return Response(
            {"error": "An unexpected error occurred. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Add more context to the error response
    if response.status_code == 400:
        # Format validation errors better
        if isinstance(response.data, dict):
            errors = {}
            for field, value in response.data.items():
                if isinstance(value, list):
                    errors[field] = value[0]
                else:
                    errors[field] = value
            
            response.data = {
                "error": "Validation error",
                "details": errors
            }
    
    # Log the error
    logger.error(f"API Error: {response.status_code} - {response.data}")
    
    return response
