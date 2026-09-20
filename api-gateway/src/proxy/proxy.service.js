const { Injectable } = require('@nestjs/common');
const axios = require('axios');
const { ApiResponse } = require('@maha-interop/shared');

@Injectable()
class ProxyService {
  constructor() {
    this.routes = {
      'auth': 'http://auth-service:8001',
      'departments': 'http://simulated-departments:8002',
      'adapters': 'http://adapter-service:8003',
      'mdm': 'http://mdm-service:8004',
      'consent': 'http://consent-service:8005',
      'workflow': 'http://workflow-engine:8006',
      'audit': 'http://audit-service:8007',
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
