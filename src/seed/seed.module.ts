import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { PropertyModule } from '../properties/property.module';
import { TaskModule } from '../tasks/task.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UserModule, PropertyModule, TaskModule],
  providers: [SeedService],
})
export class SeedModule {}
