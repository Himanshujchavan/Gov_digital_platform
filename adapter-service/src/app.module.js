const { Module } = require('@nestjs/common');
const { AdapterController } = require('./adapter.controller');
const { AdapterService } = require('./adapter.service');

const AdapterModule = Module({
  controllers: [AdapterController],
  providers: [AdapterService],
})(class {});

module.exports = { AdapterModule };
