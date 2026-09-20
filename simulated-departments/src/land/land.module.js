const { Module } = require('@nestjs/common');
const { LandService } = require('./land.service');
const { LandController } = require('./land.controller');

@Module({
  controllers: [LandController],
  providers: [LandService],
  exports: [LandService],
})
class LandModule {}

module.exports = { LandModule };