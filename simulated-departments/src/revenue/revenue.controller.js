const { Controller, Get, Param, Query, NotFoundException, Dependencies } = require('@nestjs/common');
const { RevenueService } = require('./revenue.service');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('departments/revenue')
@Dependencies(RevenueService)
class RevenueController {
  constructor(revenueService) {
    this.revenueService = revenueService;
  }

  @Get('citizens')
  getAllCitizens(@Query('search') search, @Query('limit') limit, @Query('offset') offset) {
    const result = this.revenueService.getAllCitizens({ search, limit, offset });
    return ApiResponse.success(result, 'Revenue citizens retrieved successfully');
  }

  @Get('citizens/:id')
  getCitizenById(@Param('id') id) {
    const citizen = this.revenueService.getCitizenById(id);
    if (!citizen) {
      throw new NotFoundException(`Revenue citizen with ID ${id} not found`);
    }
    return ApiResponse.success(citizen, 'Citizen retrieved successfully');
  }

  @Get('certificates/income/:citizenId')
  getIncomeCertificate(@Param('citizenId') citizenId) {
    const cert = this.revenueService.getIncomeCertificate(citizenId);
    if (!cert) {
      throw new NotFoundException(`Income certificate for citizen ${citizenId} not found in Revenue records`);
    }
    return ApiResponse.success(cert, 'Income certificate retrieved successfully');
  }

  @Get('certificates/domicile/:citizenId')
  getDomicileCertificate(@Param('citizenId') citizenId) {
    const cert = this.revenueService.getDomicileCertificate(citizenId);
    if (!cert) {
      throw new NotFoundException(`Domicile certificate for citizen ${citizenId} not found in Revenue records`);
    }
    return ApiResponse.success(cert, 'Domicile certificate retrieved successfully');
  }
}

module.exports = { RevenueController };