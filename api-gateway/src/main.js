const { NestFactory } = require('@nestjs/core');
const { GatewayModule } = require('./app.module');
const { AuthMiddleware } = require('./middleware/auth.middleware');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  
  // Apply Global Auth Middleware
  app.use(AuthMiddleware);
  
  const port = 8000;
  await app.listen(port);
  Logger.info(`API Gateway is running on port ${port}`, 'ApiGateway');
}

bootstrap();
