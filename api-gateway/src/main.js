require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { GatewayModule } = require('./app.module');
const { AuthMiddleware } = require('./middleware/auth.middleware');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Apply Global Auth Middleware
  const authMiddleware = new AuthMiddleware();
  app.use((req, res, next) => authMiddleware.use(req, res, next));
  
  const port = 8000;
  await app.listen(port);
  Logger.info(`API Gateway is running on port ${port}`, 'ApiGateway');
}

bootstrap();
