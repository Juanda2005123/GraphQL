import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {
    console.log({
      host: this.configService.get<string>('POSTGRES_HOST'),
      port: this.configService.get<string>('POSTGRES_PORT'),
      user: this.configService.get<string>('POSTGRES_USER'),
      pass: this.configService.get<string>('POSTGRES_PASSWORD'),
      db: this.configService.get<string>('POSTGRES_DB'),
    });
  }
  getHello(): string {
    return 'Hello World!';
  }
}
