import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { SeedService } from '../src/seed/seed.service';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  await app.init();
  
  // Run seed to populate database with test users
  const seedService = app.get(SeedService);
  await seedService.runSeed();
  
  return app;
}

export const mockUsers = {
  superadmin: {
    email: 'admin@example.com',
    password: 'admin1234',
  },
  agent: {
    email: 'agent@example.com',
    password: 'agent1234',
  },
  agentLisa: {
    email: 'agent.lisa@example.com',
    password: 'agentlisa1234',
  },
};

