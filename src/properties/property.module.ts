import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.model';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { Task } from '../tasks/task.model';
import { User } from '../users/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Task, User])],
  providers: [PropertyService],
  controllers: [PropertyController],
  exports: [PropertyService],
})
export class PropertyModule {}
