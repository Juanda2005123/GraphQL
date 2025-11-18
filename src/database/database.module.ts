import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Render y otros servicios en la nube proveen DATABASE_URL
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          // Producción (Render, Railway, etc.)
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: configService.get('NODE_ENV') !== 'production',
            ssl: {
              rejectUnauthorized: false, // Requerido para conexiones SSL en la nube
            },
          };
        }

        // Desarrollo local con Docker
        const port = configService.get<string>('DB_PORT');
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: port ? parseInt(port, 10) : 5432,
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
