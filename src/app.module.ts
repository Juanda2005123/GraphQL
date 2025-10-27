import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserService } from './service/user.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
