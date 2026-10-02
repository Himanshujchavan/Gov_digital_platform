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

    // Circuit Breaker state tracker per service: { failures: number, lastFailureTime: number, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }
    this.circuitBreakers = {};
    this.FAILURE_THRESHOLD = 5;
    this.RESET_TIMEOUT_MS = 30000; // 30 seconds to try half-open
    this.REQUEST_TIMEOUT_MS = 8000; // 8 seconds strict timeout
  }

  getCircuitState(serviceKey) {
    if (!this.circuitBreakers[serviceKey]) {
      this.circuitBreakers[serviceKey] = {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED',
      };
    }

    const cb = this.circuitBreakers[serviceKey];
    const now = Date.now();

    if (cb.state === 'OPEN') {
      if (now - cb.lastFailureTime > this.RESET_TIMEOUT_MS) {
        cb.state = 'HALF_OPEN';
      }
    }

    return cb;
  }

  recordSuccess(serviceKey) {
    const cb = this.getCircuitState(serviceKey);
    cb.failures = 0;
    cb.state = 'CLOSED';
  }

  recordFailure(serviceKey) {
    const cb = this.getCircuitState(serviceKey);
    cb.failures += 1;
    cb.lastFailureTime = Date.now();
    if (cb.failures >= this.FAILURE_THRESHOLD) {
      cb.state = 'OPEN';
    }
  }

  async forward(serviceKey, path, method, data, query = {}, authHeader) {
    const targetBase = this.routes[serviceKey];
    if (!targetBase) {
      throw new Error(`No route configured for service: ${serviceKey}`);
    }

    const cb = this.getCircuitState(serviceKey);
    if (cb.state === 'OPEN') {
      return {
        status: 503,
        data: ApiResponse.error(
          `Service '${serviceKey}' is temporarily unavailable (circuit breaker open). Please retry shortly.`,
          'Circuit Breaker Tripped'
        )
      };
    }

    try {
      const response = await axios({
        method,
        url: `${targetBase}${path}`,
        data,
        params: query,
        timeout: this.REQUEST_TIMEOUT_MS,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authHeader 
        }
      });

      this.recordSuccess(serviceKey);
      return response.data;
    } catch (error) {
      // 5xx errors or network timeouts trigger failure count
      const status = error.response?.status || 500;
      if (status >= 500 || error.code === 'ECONNABORTED' || !error.response) {
        this.recordFailure(serviceKey);
      }

      const message = error.code === 'ECONNABORTED'
        ? `Request to '${serviceKey}' timed out after ${this.REQUEST_TIMEOUT_MS}ms`
        : (error.response?.data?.message || error.message || 'Upstream service error');

      return {
        status,
        data: ApiResponse.error(message, status, error.response?.data?.errors || null)
      };
    }
  }
}

module.exports = { ProxyService };
