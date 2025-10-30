import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.model';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Property } from '../properties/property.model';
import { User } from '../users/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Property, User])],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
