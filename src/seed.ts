import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function runSeed() {
  console.log('🌱 Iniciando proceso de seed...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedService = app.get(SeedService);
    await seedService.runSeed();

    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error al ejecutar el seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void runSeed();
