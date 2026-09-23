const { Controller, Post, Get, Put, Body, Param, NotFoundException } = require('@nestjs/common');
const { WorkflowService } = require('./workflow.service');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('workflow')
class WorkflowController {
  constructor(workflowService) {
    this.workflowService = workflowService;
  }

  @Post('submit')
  async submit(@Body() body) {
    const { citizenId, schemeId, requestedData } = body;
    const result = await this.workflowService.submitApplication(citizenId, schemeId, requestedData);
    return ApiResponse.success(result, 'Application submitted and workflow initiated');
  }

  @Get('status/:id')
  async getStatus(@Param('id') id) {
    const app = this.workflowService.getApplication(id);
    if (!app) throw new NotFoundException('Application not found');
    return ApiResponse.success(app, 'Application status retrieved');
  }

  @Get('timeline/:id')
  async getTimeline(@Param('id') id) {
    const app = this.workflowService.getApplication(id);
    if (!app) throw new NotFoundException('Application not found');
    return ApiResponse.success(app.history, 'Workflow timeline retrieved');
  }

  @Put('transition/:id')
  async transition(@Param('id') id, @Body() body) {
    const { newState } = body;
    await this.workflowService.transition(id, newState);
    return ApiResponse.success({ appId: id, newState }, 'Workflow state transitioned successfully');
  }

  @Put('review/:id')
  async review(@Param('id') id, @Body() body) {
    const app = this.workflowService.getApplication(id);
    if (!app) throw new NotFoundException('Application not found');
    if (app.currentState !== 'OFFICER_REVIEW') {
      throw new BadRequestException('Application not in OFFICER_REVIEW state');
    }
    const { decision } = body; // 'APPROVE' or 'REJECT'
    const state = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await this.workflowService.transition(id, state);
    return ApiResponse.success({ appId: id, status: state }, 'Officer review processed');
  }
}

module.exports = { WorkflowController };
