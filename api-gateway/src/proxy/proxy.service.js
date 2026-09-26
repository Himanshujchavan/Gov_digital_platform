const { Injectable } = require('@nestjs/common');
const axios = require('axios');
const { ApiResponse } = require('@maha-interop/shared');

@Injectable()
class ProxyService {
  constructor() {
    this.routes = {
      'auth': process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
      'departments': process.env.DEPARTMENTS_SERVICE_URL || 'http://localhost:8002',
      'adapters': process.env.ADAPTERS_SERVICE_URL || 'http://localhost:8003',
      'mdm': process.env.MDM_SERVICE_URL || 'http://localhost:8004',
      'consent': process.env.CONSENT_SERVICE_URL || 'http://localhost:8005',
      'workflow': process.env.WORKFLOW_SERVICE_URL || 'http://localhost:8006',
      'audit': process.env.AUDIT_SERVICE_URL || 'http://localhost:8007',
    };
  }

  async forward(serviceKey, path, method, data, query = {}, authHeader) {
    const targetBase = this.routes[serviceKey];
    if (!targetBase) {
      throw new Error(`No route configured for service: ${serviceKey}`);
    }

    try {
      const response = await axios({
        method,
        url: `${targetBase}${path}`,
        data,
        params: query,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authHeader 
        }
      });
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      return {
        status,
        data: ApiResponse.error(message, 'Upstream service error')
      };
    }
  }
}

module.exports = { ProxyService };
