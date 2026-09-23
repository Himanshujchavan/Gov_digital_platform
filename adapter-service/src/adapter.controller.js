const { Controller, Post, Get, Body, Param, BadRequestException } = require('@nestjs/common');
const { AdapterService } = require('./adapter.service');
const { ApiResponse } = require('@maha-interop/shared');

class AdapterController {
  constructor(adapterService) {
    this.adapterService = adapterService;
  }

  async transform(body) {
    const { department, data } = body;
    if (!department || !data) {
      throw new BadRequestException('Missing department or data in request body');
    }
    const result = this.adapterService.transform(department, data);
    return ApiResponse.success(result, `Data transformed from ${department} to canonical format`);
  }

  async reverseTransform(body) {
    const { department, data } = body;
    if (!department || !data) {
      throw new BadRequestException('Missing department or data in request body');
    }
    const result = this.adapterService.reverseTransform(department, data);
    return ApiResponse.success(result, `Data reverse-transformed from canonical to ${department} format`);
  }

  async getSchema(department) {
    const schema = this.adapterService.getSchema(department);
    return ApiResponse.success(schema, `Schema mapping for ${department} retrieved`);
  }
}

// Apply NestJS decorators manually (functional style)
Controller('adapters')(AdapterController);
Post('transform')(AdapterController.prototype, 'transform', Object.getOwnPropertyDescriptor(AdapterController.prototype, 'transform'));
Post('reverse-transform')(AdapterController.prototype, 'reverseTransform', Object.getOwnPropertyDescriptor(AdapterController.prototype, 'reverseTransform'));
Get('schema/:department')(AdapterController.prototype, 'getSchema', Object.getOwnPropertyDescriptor(AdapterController.prototype, 'getSchema'));

module.exports = { AdapterController };
