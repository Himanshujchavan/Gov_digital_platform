const { Module } = require('@nestjs/common');
const { AuditController } = require('./audit/audit.controller');
const { AuditService } = require('./audit/audit.service');

@Module({
  controllers: [AuditController],
  providers: [AuditService],
})
class AuditModule {}

module.exports = { AuditModule };
