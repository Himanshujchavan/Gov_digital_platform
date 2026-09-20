const { Controller, Get, Post, Body, Param, Query, NotFoundException, Dependencies } = require('@nestjs/common');
const { WelfareService } = require('./welfare.service');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('departments/welfare')
@Dependencies(WelfareService)
class WelfareController {
  constructor(welfareService) {
    this.welfareService = welfareService;
  }

  @Get('beneficiaries')
  getAllBeneficiaries(@Query('search') search, @Query('limit') limit, @Query('offset') offset) {
    const result = this.welfareService.getAllBeneficiaries({ search, limit, offset });
    return ApiResponse.success(result, 'Welfare beneficiaries retrieved successfully');
  }

  @Get('beneficiaries/:id')
  getBeneficiaryById(@Param('id') id) {
    const beneficiary = this.welfareService.getBeneficiaryById(id);
    if (!beneficiary) {
      throw new NotFoundException(`Welfare beneficiary with ID ${id} not found`);
    }
    return ApiResponse.success(beneficiary, 'Beneficiary retrieved successfully');
  }

  @Get('schemes')
  getSchemes() {
    const schemes = this.welfareService.getSchemes();
    return ApiResponse.success(schemes, 'Active welfare schemes retrieved successfully');
  }

  @Post('applications')
  submitApplication(@Body() body) {
    const application = this.welfareService.submitApplication(body);
    return ApiResponse.success(application, 'Application submitted to MahaDBT successfully');
  }

  @Get('applications/:id')
  getApplicationById(@Param('id') id) {
    const app = this.welfareService.getApplicationById(id);
    if (!app) {
      throw new NotFoundException(`MahaDBT application with ID ${id} not found`);
    }
    return ApiResponse.success(app, 'Application status retrieved successfully');
  }
}

module.exports = { WelfareController };