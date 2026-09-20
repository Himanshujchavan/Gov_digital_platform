const { Module } = require('@nestjs/common');
const { ConsentController } = require('./consent/consent.controller');
const { ConsentService } = require('./consent/consent.service');
const { ConsentGuard } = require('./common/consent.guard');

@Module({
  controllers: [ConsentController],
  providers: [ConsentService],
})
class ConsentModule {}

module.exports = { ConsentModule };
