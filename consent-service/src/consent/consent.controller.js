const {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Req,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Query,
  Dependencies,
} = require('@nestjs/common');
const { ConsentService } = require('./consent.service');
const { ApiResponse, Roles, extractUserFromAuthHeader } = require('@maha-interop/shared');

@Controller('consent')
@Dependencies(ConsentService)
class ConsentController {
  constructor(consentService) {
    this.consentService = consentService;
  }

  getAuthenticatedUser(req) {
    try {
      return extractUserFromAuthHeader(req.headers.authorization);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  ensureCitizenSelfOrPrivileged(user, citizenId) {
    if (user.role === Roles.ADMIN || user.role === Roles.OFFICER) {
      return;
    }
    if (user.role === Roles.CITIZEN && user.username === citizenId) {
      return;
    }
    throw new ForbiddenException('You are not authorized for this consent resource');
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
  async respond(@Req() req, @Param('consentId') consentId, @Body() body) {
    const user = this.getAuthenticatedUser(req);
    const { decision, signature } = body;
    if (!['APPROVE', 'REJECT'].includes(decision)) {
      throw new BadRequestException('Decision must be either APPROVE or REJECT');
    }
    try {
      const consent = await this.consentService.getById(consentId);
      if (!consent) {
        throw new NotFoundException('Consent request not found');
      }
      this.ensureCitizenSelfOrPrivileged(user, consent.citizen_id);
      const result = await this.consentService.respond(consentId, decision, signature);
      return ApiResponse.success(result, `Consent ${decision === 'APPROVE' ? 'granted' : 'rejected'} successfully`);
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof ForbiddenException || e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException(e.message);
    }
  }

  @Put('/:consentId/revoke')
  async revoke(@Req() req, @Param('consentId') consentId) {
    const user = this.getAuthenticatedUser(req);
    try {
      const consent = await this.consentService.getById(consentId);
      if (!consent) {
        throw new NotFoundException('Consent request not found');
      }
      this.ensureCitizenSelfOrPrivileged(user, consent.citizen_id);
      const result = await this.consentService.revoke(consentId);
      return ApiResponse.success(result, 'Consent revoked successfully');
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof ForbiddenException || e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException(e.message);
    }
  }

  @Get('pending/:citizenId')
  async getPending(@Req() req, @Param('citizenId') citizenId) {
    const user = this.getAuthenticatedUser(req);
    this.ensureCitizenSelfOrPrivileged(user, citizenId);
    const history = await this.consentService.getHistory(citizenId);
    const pending = history.filter(c => c.status === 'PENDING');
    return ApiResponse.success(pending, 'Pending consent requests retrieved');
  }

  @Get('history/:citizenId')
  async getHistory(@Req() req, @Param('citizenId') citizenId) {
    const user = this.getAuthenticatedUser(req);
    this.ensureCitizenSelfOrPrivileged(user, citizenId);
    const history = await this.consentService.getHistory(citizenId);
    return ApiResponse.success(history, 'Consent history retrieved');
  }

  @Get('validate')
  async validate(@Query('citizenId') citizenId, @Query('deptId') deptId, @Query('field') field) {
    const isValid = await this.consentService.validate(citizenId, deptId, field);
    return ApiResponse.success({ isValid }, 'Consent validation completed');
  }

  @Get('validate-application/:appId')
  async validateApplication(
    @Param('appId') appId,
    @Query('requesterDept') requesterDept,
    @Query('purpose') purpose,
    @Query('requestedFields') requestedFields,
  ) {
    const fields = requestedFields
      ? requestedFields.split(',').map((field) => field.trim()).filter(Boolean)
      : [];
    const isValid = await this.consentService.validateForApplication(appId, requesterDept, purpose, fields);
    return ApiResponse.success({ isValid }, 'Application consent validation completed');
  }
}

module.exports = { ConsentController };
