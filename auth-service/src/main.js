require('dotenv').config();
const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('./app.module');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const logger = new Logger('AuthService');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Maharashtra Interop - Auth Service API')
    .setDescription('Federated Authentication, JWT and RBAC Service')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.AUTH_PORT || process.env.PORT || 8001;
  await app.listen(port);
  logger.log(`Auth Service running on http://localhost:${port}`);
  logger.log(`Swagger UI available at http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal error starting Auth Service:', err);
  process.exit(1);
});
