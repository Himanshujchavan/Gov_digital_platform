const { Controller, Get, Param, Query, NotFoundException, Dependencies } = require('@nestjs/common');
const { LandService } = require('./land.service');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('departments/land')
@Dependencies(LandService)
class LandController {
  constructor(landService) {
    this.landService = landService;
  }

  @Get('records')
  getAllRecords(@Query('search') search, @Query('limit') limit, @Query('offset') offset) {
    const result = this.landService.getAllRecords({ search, limit, offset });
    return ApiResponse.success(result, 'Land records retrieved successfully');
  }

  @Get('records/:id')
  getRecordById(@Param('id') id) {
    const record = this.landService.getRecordById(id);
    if (!record) {
      throw new NotFoundException(`Land record with ID ${id} not found`);
    }
    return ApiResponse.success(record, 'Land record retrieved successfully');
  }

  @Get('712-extract/:id')
  getExtract712(@Param('id') id) {
    const extract = this.landService.getExtract712(id);
    if (!extract) {
      throw new NotFoundException(`7/12 extract for land record ${id} not found`);
    }
    return ApiResponse.success(extract, 'Digitally signed 7/12 extract retrieved successfully');
  }

  @Get('property-card/:id')
  getPropertyCard(@Param('id') id) {
    const card = this.landService.getPropertyCard(id);
    if (!card) {
      throw new NotFoundException(`Property card for land record ${id} not found`);
    }
    return ApiResponse.success(card, 'Property card retrieved successfully');
  }
}

module.exports = { LandController };