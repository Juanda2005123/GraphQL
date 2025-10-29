import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const seedService = app.get(SeedService);
  await seedService.runSeed();

  app.useGlobalPipes(new ValidationPipe()); //4 validation
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
