require('dotenv').config();
const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('./app.module');
const { Logger } = require('@maha-interop/shared');

async function bootstrap() {
  const logger = new Logger('SimulatedDepartmentsService');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Maharashtra Simulated Departments API')
    .setDescription('Simulated Heterogeneous Department APIs (Aaple Sarkar, MahaDBT 2.0, Mahabhumi)')
    .setVersion('1.0.0')
    .addTag('Revenue (Aaple Sarkar)')
    .addTag('Welfare (MahaDBT 2.0)')
    .addTag('Land Records (Mahabhumi)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.DEPARTMENTS_PORT || process.env.PORT || 8002;
  await app.listen(port);
  logger.log(`Simulated Departments running on http://localhost:${port}`);
  logger.log(`Swagger UI available at http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal error starting Simulated Departments:', err);
  process.exit(1);
});