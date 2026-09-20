const { NextFunction, Request, Response } = require('@nestjs/common');
const { ApiResponse } = require('@maha-interop/shared');

class AuthMiddleware {
  use(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // Skip auth for auth-service endpoints
    if (req.url.startsWith('/api/auth')) {
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        ApiResponse.error('Unauthorized', 'Missing or invalid Bearer token')
      );
    }
    
    // In a real system, we would call auth-service:8001/auth/me to validate the JWT
    // For this implementation, we assume the token is valid if present
    next();
  }
}

module.exports = { AuthMiddleware };
