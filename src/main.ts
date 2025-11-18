import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configurado para desarrollo y producción
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? true // Permite cualquier origen en producción (o especifica tu frontend)
      : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Real Estate API')
    .setDescription(
      'API REST para gestión inmobiliaria con autenticación JWT, roles (superadmin/agente) y operaciones CRUD sobre usuarios, propiedades y tareas.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticación y registro')
    .addTag('users', 'Gestión de usuarios')
    .addTag('properties', 'Gestión de propiedades inmobiliarias')
    .addTag('tasks', 'Gestión de tareas asociadas a propiedades')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Real Estate API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces (requerido para Render)

  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
  console.error('Failed to bootstrap NestJS application', error);
  process.exit(1);
});
