const { Controller, Post, Put, Get, Body, Param, NotFoundException, BadRequestException, Query, Dependencies } = require('@nestjs/common');
const { ConsentService } = require('./consent.service');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('consent')
@Dependencies(ConsentService)
class ConsentController {
  constructor(consentService) {
    this.consentService = consentService;
  }

  @Post('request')
  async request(@Body() body) {
    const { appId, citizenId, requesterDept, purpose, dataFields } = body;
    if (!appId || !citizenId || !requesterDept || !purpose || !dataFields) {
      throw new BadRequestException('Missing required fields for consent request');
    }
    const result = await this.consentService.createRequest(appId, citizenId, requesterDept, purpose, dataFields);
    return ApiResponse.success(result, 'Consent request created successfully');
  }

  @Put('/:consentId/respond')
  async respond(@Param('consentId') consentId, @Body() body) {
    const { decision, signature } = body;
    if (!['APPROVE', 'REJECT'].includes(decision)) {
      throw new BadRequestException('Decision must be either APPROVE or REJECT');
    }
    try {
      const result = await this.consentService.respond(consentId, decision, signature);
      return ApiResponse.success(result, `Consent ${decision === 'APPROVE' ? 'granted' : 'rejected'} successfully`);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put('/:consentId/revoke')
  async revoke(@Param('consentId') consentId) {
    try {
      const result = await this.consentService.revoke(consentId);
      return ApiResponse.success(result, 'Consent revoked successfully');
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('pending/:citizenId')
  async getPending(@Param('citizenId') citizenId) {
    const history = this.consentService.getHistory(citizenId);
    const pending = history.filter(c => c.status === 'PENDING');
    return ApiResponse.success(pending, 'Pending consent requests retrieved');
  }

  @Get('history/:citizenId')
  async getHistory(@Param('citizenId') citizenId) {
    const history = this.consentService.getHistory(citizenId);
    return ApiResponse.success(history, 'Consent history retrieved');
  }

  @Get('validate')
  async validate(@Query('citizenId') citizenId, @Query('deptId') deptId, @Query('field') field) {
    const isValid = await this.consentService.validate(citizenId, deptId, field);
    return ApiResponse.success({ isValid }, 'Consent validation completed');
  }
}

module.exports = { ConsentController };
