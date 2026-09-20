const { NestFactory } = require('@nestjs/core');
const { ConsentModule } = require('./app.module');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(ConsentModule);
  const port = 8005;
  await app.listen(port);
  Logger.info(`Consent Service is running on port ${port}`, 'ConsentService');
}

bootstrap();
