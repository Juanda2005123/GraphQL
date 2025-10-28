import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserService } from './users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { PropertyModule } from './properties/property.module';
import { TaskModule } from './tasks/task.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
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
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el config esté disponible globalmente
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: process.env.POSTGRES_PASSWORD,
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    PropertyModule,
    TaskModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
console.log(
  'Guaooooooooooooooooooooooooo: ENV:',
  process.env.POSTGRES_PASSWORD,
);
