const { Module } = require('@nestjs/common');
const { WorkflowController } = require('./workflow/workflow.controller');
const { WorkflowService } = require('./workflow/workflow.service');

@Module({
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
class WorkflowModule {}

module.exports = { WorkflowModule };
