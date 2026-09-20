const { NextFunction, Request, Response } = require('@nestjs/common');
const { ApiResponse } = require('@maha-interop/shared');
const axios = require('axios');

class AuthMiddleware {
  async use(req, res, next) {
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
    
    try {
      // SECURITY FIX: Actually validate the token with the Auth Service
      const token = authHeader.split(' ')[1];
      const response = await axios.get('http://auth-service:8001/auth/me', {
        headers: { Authorization: authHeader }
      });
      
      if (response.status === 200) {
        req.user = response.data.data;
        next();
      }
    } catch (error) {
      return res.status(401).json(
        ApiResponse.error('Unauthorized', 'Invalid or expired token')
      );
    }
  }
}

module.exports = { AuthMiddleware };
