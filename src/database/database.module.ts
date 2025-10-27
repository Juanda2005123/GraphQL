import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10), //Usa el puerto del .env o el 5432
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true, // Esta opción encuentra tus entidades automáticamente
      synchronize: true, // Solo en desarrollo. No en producción.
    }),
  ],
})
export class DatabaseModule {}
