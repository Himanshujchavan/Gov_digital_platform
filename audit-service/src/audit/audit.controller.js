const {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Req,
  ForbiddenException,
  UnauthorizedException,
  Dependencies,
} = require('@nestjs/common');
const { AuditService } = require('./audit.service');
const { ApiResponse, Roles, extractUserFromAuthHeader } = require('@maha-interop/shared');

@Controller('audit')
@Dependencies(AuditService)
class AuditController {
  constructor(auditService) {
    this.auditService = auditService;
  }

  getAuthenticatedUser(req) {
    try {
      return extractUserFromAuthHeader(req.headers.authorization);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  assertAdmin(user) {
    if (user.role !== Roles.ADMIN) {
      throw new ForbiddenException('Only admin can access audit APIs');
    }
  }

  @Get('events')
  getEvents(@Req() req, @Query('type') type) {
    const user = this.getAuthenticatedUser(req);
    this.assertAdmin(user);
    const logs = this.auditService.getLogs({ type });
    return ApiResponse.success(logs, 'Audit events retrieved successfully');
  }

  @Get('trail/:resourceId')
  getTrail(@Req() req, @Param('resourceId') resourceId) {
    const user = this.getAuthenticatedUser(req);
    this.assertAdmin(user);
    const trail = this.auditService.getTrail(resourceId);
    return ApiResponse.success(trail, `Audit trail for ${resourceId} retrieved`);
  }

  @Post('log')
  async manualLog(@Req() req, @Body() body) {
    const user = this.getAuthenticatedUser(req);
    this.assertAdmin(user);
    // Allows other services to push custom audit events
    await this.auditService.logEvent(body.type || 'MANUAL', body.payload);
    return ApiResponse.success({ status: 'Logged' }, 'Manual audit event recorded');
  }
}

module.exports = { AuditController };
