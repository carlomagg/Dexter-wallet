import json
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(MiddlewareMixin):
    """Middleware to log API requests for debugging purposes."""
    
    def process_request(self, request):
        """Log the incoming request details."""
        if request.path.startswith('/api/'):
            logger.info(f"API Request: {request.method} {request.path}")
            
            # Don't log sensitive endpoints like auth
            if not request.path.startswith('/api/auth/'):
                try:
                    if request.body:
                        body = request.body.decode('utf-8')
                        if body:
                            # Truncate long bodies
                            if len(body) > 1000:
                                body = body[:1000] + '... [truncated]'
                            logger.debug(f"Request Body: {body}")
                except Exception as e:
                    logger.error(f"Error logging request body: {str(e)}")
        
        return None
    
    def process_response(self, request, response):
        """Log the response status code."""
        if request.path.startswith('/api/'):
            logger.info(f"API Response: {request.method} {request.path} - {response.status_code}")
        
        return response
