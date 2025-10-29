import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { DatabaseModule } from './database/database.module';
import { UserService } from './users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { PropertyModule } from './properties/property.module';
import { TaskModule } from './tasks/task.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
dotenv.config();
console.log('ENV:', process.env.POSTGRES_PASSWORD);

console.log({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  pass: process.env.POSTGRES_PASSWORD,
  db: process.env.POSTGRES_DB,
});

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT!,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, //Solo usarla en ambientes bajos, en prod hacer migraciones
    }),
    UserModule,
    PropertyModule,
    TaskModule,
    AuthModule,
    SeedModule,
    //DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
console.log(
  'Guaooooooooooooooooooooooooo: ENV:',
  process.env.POSTGRES_PASSWORD,
);
