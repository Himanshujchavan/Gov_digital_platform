const { Controller, Post, Get, Body, Param, BadRequestException } = require('@nestjs/common');
const { AdapterService } = require('./adapter.service');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('adapters')
class AdapterController {
  constructor(adapterService) {
    this.adapterService = adapterService;
  }

  @Post('transform')
  transform(@Body() body) {
    const { department, data } = body;
    if (!department || !data) {
      throw new BadRequestException('Missing department or data in request body');
    }
    const result = this.adapterService.transform(department, data);
    return ApiResponse.success(result, `Data transformed from ${department} to canonical format`);
  }

  @Post('reverse-transform')
  reverseTransform(@Body() body) {
    const { department, data } = body;
    if (!department || !data) {
      throw new BadRequestException('Missing department or data in request body');
    }
    const result = this.adapterService.reverseTransform(department, data);
    return ApiResponse.success(result, `Data reverse-transformed from canonical to ${department} format`);
  }

  @Get('schema/:department')
  getSchema(@Param('department') department) {
    const schema = this.adapterService.getSchema(department);
    return ApiResponse.success(schema, `Schema mapping for ${department} retrieved`);
  }
}

module.exports = { AdapterController };
