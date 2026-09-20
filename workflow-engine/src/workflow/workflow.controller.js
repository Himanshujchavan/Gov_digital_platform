const { Controller, Post, Get, Put, Body, Param, NotFoundException } = require('@nestjs/common');
const { WorkflowService } = require('./workflow.service');
const { ApiResponse } = require('@maha-interop/shared');

class WorkflowController {
  constructor(workflowService) {
    this.workflowService = workflowService;
  }

  async submit(body) {
    const { citizenId, schemeId, requestedData } = body;
    const result = await this.workflowService.submitApplication(citizenId, schemeId, requestedData);
    return ApiResponse.success(result, 'Application submitted and workflow initiated');
  }

  async getStatus(id) {
    const app = this.workflowService.getApplication(id);
    if (!app) throw new NotFoundException('Application not found');
    return ApiResponse.success(app, 'Application status retrieved');
  }

  async getTimeline(id) {
    const app = this.workflowService.getApplication(id);
    if (!app) throw new NotFoundException('Application not found');
    return ApiResponse.success(app.history, 'Workflow timeline retrieved');
  }

  async transition(id, body) {
    const { newState } = body;
    await this.workflowService.transition(id, newState);
    return ApiResponse.success({ appId: id, newState }, 'Workflow state transitioned successfully');
  }

  async review(id, body) {
    const { decision } = body; // 'APPROVE' or 'REJECT'
    // In a real system, this would transition from OFFICER_REVIEW
    const state = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await this.workflowService.transition(id, state);
    return ApiResponse.success({ appId: id, status: state }, 'Officer review processed');
  }
}

module.exports = { WorkflowController };
