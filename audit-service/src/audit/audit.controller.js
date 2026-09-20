const { Controller, Get, Post, Body, Query, Param } = require('@nestjs/common');
const { AuditService } = require('./audit.service');
const { ApiResponse } = require('@maha-interop/shared');

class AuditController {
  constructor(auditService) {
    this.auditService = auditService;
  }

  getEvents(type) {
    const logs = this.auditService.getLogs({ type });
    return ApiResponse.success(logs, 'Audit events retrieved successfully');
  }

  getTrail(resourceId) {
    const trail = this.auditService.getTrail(resourceId);
    return ApiResponse.success(trail, `Audit trail for ${resourceId} retrieved`);
  }

  async manualLog(body) {
    // Allows other services to push custom audit events
    await this.auditService.logEvent(body.type || 'MANUAL', body.payload);
    return ApiResponse.success({ status: 'Logged' }, 'Manual audit event recorded');
  }
}

module.exports = { AuditController };
