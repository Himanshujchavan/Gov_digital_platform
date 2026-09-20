const { Module } = require('@nestjs/common');
const { AdapterController } = require('./adapter.controller');
const { AdapterService } = require('./adapter.service');

@Module({
  controllers: [AdapterController],
  providers: [AdapterService],
})
class AdapterModule {}

module.exports = { AdapterModule };
