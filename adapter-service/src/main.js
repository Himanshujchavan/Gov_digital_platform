const { NestFactory } = require('@nestjs/core');
const { AdapterModule } = require('./app.module');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(AdapterModule);
  const port = 8003;
  await app.listen(port);
  Logger.info(`Adapter Service is running on port ${port}`, 'AdapterService');
}

bootstrap();
