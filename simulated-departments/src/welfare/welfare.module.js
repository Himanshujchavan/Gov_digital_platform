const { Module } = require('@nestjs/common');
const { WelfareService } = require('./welfare.service');
const { WelfareController } = require('./welfare.controller');

@Module({
  controllers: [WelfareController],
  providers: [WelfareService],
  exports: [WelfareService],
})
class WelfareModule {}

module.exports = { WelfareModule };