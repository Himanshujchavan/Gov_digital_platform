const { Module } = require('@nestjs/common');
const { RevenueService } = require('./revenue.service');
const { RevenueController } = require('./revenue.controller');

@Module({
  controllers: [RevenueController],
  providers: [RevenueService],
  exports: [RevenueService],
})
class RevenueModule {}

module.exports = { RevenueModule };