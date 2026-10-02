const {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Dependencies,
} = require('@nestjs/common');
const { WorkflowService } = require('./workflow.service');
const { ApiResponse, Roles, WorkflowStates, extractUserFromAuthHeader } = require('@maha-interop/shared');

@Controller('workflow')
@Dependencies(WorkflowService)
class WorkflowController {
  constructor(workflowService) {
    this.workflowService = workflowService;
  }

  getAuthenticatedUser(req) {
    try {
      return extractUserFromAuthHeader(req.headers.authorization);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  normalizeRequestedData(app) {
    if (!app) return {};
    const raw = app.requested_data;
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (_error) {
        return {};
      }
    }
    return raw;
  }

  canReadApplication(user, app) {
    if (!user || !app) return false;
    const requestedData = this.normalizeRequestedData(app);
    if (user.role === Roles.ADMIN) return true;
    if (user.role === Roles.CITIZEN) return app.citizen_id === user.username;
    if (user.role === Roles.OFFICER) {
      return requestedData.department
        ? requestedData.department.toLowerCase() === String(user.department || '').toLowerCase()
        : false;
    }
    return false;
  }

  @Post('submit')
  async submit(@Req() req, @Body() body) {
    const user = this.getAuthenticatedUser(req);
    const citizenId = body.citizenId;
    const schemeId = body.schemeId;
    if (!citizenId || !schemeId) {
      throw new BadRequestException('citizenId and schemeId are required');
    }
    if (user.role === Roles.CITIZEN && citizenId !== user.username) {
      throw new ForbiddenException('Citizens can only submit their own applications');
    }
    const requestedData = body.requestedData || body;
    const result = await this.workflowService.submitApplication(citizenId, schemeId, requestedData);
    return ApiResponse.success(result, 'Application submitted and workflow initiated');
  }

  @Get('pending-reviews')
  async getPendingReviews(@Req() req, @Query('department') department) {
    const user = this.getAuthenticatedUser(req);
    if (![Roles.OFFICER, Roles.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Only officers or admins can access pending reviews');
    }
    const enforcedDepartment = user.role === Roles.OFFICER ? user.department : department;
    const list = await this.workflowService.getPendingReviews(enforcedDepartment);
    return ApiResponse.success(list, 'Pending reviews retrieved');
  }

  @Get('applications')
  async getApplications(@Req() req) {
    const user = this.getAuthenticatedUser(req);
    const list = await this.workflowService.getApplications();
    const filtered = list.filter((item) => {
      const requestedData = this.normalizeRequestedData(item);
      if (user.role === Roles.ADMIN) return true;
      if (user.role === Roles.CITIZEN) return item.citizen_id === user.username;
      if (user.role === Roles.OFFICER) {
        return requestedData.department
          && requestedData.department.toLowerCase() === String(user.department || '').toLowerCase();
      }
      return false;
    });
    return ApiResponse.success(filtered, 'Applications retrieved');
  }

  async getAuthorizedApplication(req, id) {
    const user = this.getAuthenticatedUser(req);
    const app = await this.workflowService.getApplication(id);
    if (!app) throw new NotFoundException('Application not found');
    if (!this.canReadApplication(user, app)) {
      throw new ForbiddenException('You are not authorized to access this application');
    }
    return app;
  }

  @Get('applications/:id')
  async getApplicationById(@Req() req, @Param('id') id) {
    const app = await this.getAuthorizedApplication(req, id);
    return ApiResponse.success(app, 'Application retrieved');
  }

  @Get('status/:id')
  async getStatus(@Req() req, @Param('id') id) {
    const app = await this.getAuthorizedApplication(req, id);
    return ApiResponse.success(app, 'Application status retrieved');
  }

  @Get(['timeline/:id', 'applications/:id/timeline'])
  async getTimeline(@Req() req, @Param('id') id) {
    const app = await this.getAuthorizedApplication(req, id);
    return ApiResponse.success(app.history || [], 'Workflow timeline retrieved');
  }

  @Put(['transition/:id', 'applications/:id/transition'])
  async transition(@Req() req, @Param('id') id, @Body() body) {
    const user = this.getAuthenticatedUser(req);
    if (![Roles.OFFICER, Roles.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Only officers or admins can transition applications');
    }
    const app = await this.getAuthorizedApplication(req, id);
    const { newState } = body;
    if (!Object.values(WorkflowStates).includes(newState)) {
      throw new BadRequestException('Invalid workflow state');
    }
    if (user.role === Roles.OFFICER && ![WorkflowStates.APPROVED, WorkflowStates.REJECTED].includes(newState)) {
      throw new ForbiddenException('Officers can only issue final review decisions');
    }
    await this.workflowService.transition(id, newState);
    return ApiResponse.success({ appId: id, fromState: app.current_state, newState }, 'Workflow state transitioned successfully');
  }

  @Put(['review/:id', 'applications/:id/review'])
  async review(@Req() req, @Param('id') id, @Body() body) {
    const user = this.getAuthenticatedUser(req);
    if (![Roles.OFFICER, Roles.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Only officers or admins can review applications');
    }
    const app = await this.workflowService.getApplication(id);
    if (!app) throw new NotFoundException('Application not found');
    if (!this.canReadApplication(user, app)) {
      throw new ForbiddenException('You are not authorized to review this application');
    }
    if (app.current_state !== 'OFFICER_REVIEW' && app.currentState !== 'OFFICER_REVIEW') {
      throw new BadRequestException('Application not in OFFICER_REVIEW state');
    }
    const { decision } = body; // 'APPROVE' or 'REJECT'
    const state = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await this.workflowService.transition(id, state);
    return ApiResponse.success({ appId: id, status: state }, 'Officer review processed');
  }
}

module.exports = { WorkflowController };
