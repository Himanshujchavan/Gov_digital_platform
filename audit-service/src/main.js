require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AuditModule } = require('./app.module');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(AuditModule);
  const port = 8007;
  await app.listen(port);
  Logger.info(`Audit Service is running on port ${port}`, 'AuditService');
}

bootstrap();
