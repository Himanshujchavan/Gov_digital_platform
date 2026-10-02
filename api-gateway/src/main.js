require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { GatewayModule } = require('./app.module');
const { AuthMiddleware } = require('./middleware/auth.middleware');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  
  // Load allowed origins from env (comma‑separated). Fallback to localhost dev origin.
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000'];

  // Enable CORS with whitelist and credentials
  app.enableCors({
    origin: allowedOrigins,
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
