const { Controller, Get, Post, Body, Query, Param, Dependencies } = require('@nestjs/common');
const { AuditService } = require('./audit.service');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('audit')
@Dependencies(AuditService)
class AuditController {
  constructor(auditService) {
    this.auditService = auditService;
  }

  @Get('events')
  getEvents(@Query('type') type) {
    const logs = this.auditService.getLogs({ type });
    return ApiResponse.success(logs, 'Audit events retrieved successfully');
  }

  @Get('trail/:resourceId')
  getTrail(@Param('resourceId') resourceId) {
    const trail = this.auditService.getTrail(resourceId);
    return ApiResponse.success(trail, `Audit trail for ${resourceId} retrieved`);
  }

  @Post('log')
  async manualLog(@Body() body) {
    // Allows other services to push custom audit events
    await this.auditService.logEvent(body.type || 'MANUAL', body.payload);
    return ApiResponse.success({ status: 'Logged' }, 'Manual audit event recorded');
  }
}

module.exports = { AuditController };
