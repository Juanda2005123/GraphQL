import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const seedService = app.get(SeedService);
  await seedService.runSeed();

  app.useGlobalPipes(new ValidationPipe()); //4 validation
  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `🚀 Aplicación corriendo en: http://localhost:${process.env.PORT ?? 3001}`,
  );
}
bootstrap().catch((error) => {
  console.error('Failed to bootstrap NestJS application', error);
  process.exit(1);
});
