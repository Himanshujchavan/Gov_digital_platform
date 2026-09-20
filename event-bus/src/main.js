const { NestFactory } = require('@nestjs/core');
const { EventBusModule } = require('./app.module');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(EventBusModule);
  Logger.info(`Event Bus Listener is active and monitoring exchanges...`, 'EventBus');
}

bootstrap();
