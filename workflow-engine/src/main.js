require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { WorkflowModule } = require('./app.module');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(WorkflowModule);
  const port = 8006;
  await app.listen(port);
  Logger.info(`Workflow Engine is running on port ${port}`, 'WorkflowEngine');
}

bootstrap();
