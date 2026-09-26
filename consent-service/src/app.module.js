const { Module } = require('@nestjs/common');
const { ConsentController } = require('./consent/consent.controller');
const { ConsentService } = require('./consent/consent.service');

@Module({
  controllers: [ConsentController],
  providers: [ConsentService],
})
class ConsentModule {}

module.exports = { ConsentModule };
