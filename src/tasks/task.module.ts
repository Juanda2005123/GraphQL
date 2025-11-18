import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.model';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
// import { TaskController } from './task.controller'; // DEPRECATED: REST API removed
import { Property } from '../properties/property.model';
import { User } from '../users/user.model';
import { PropertyModule } from '../properties/property.module';
import { UserModule } from '../users/user.module';

/**
 * Task Module - GraphQL Only
 *
 * Gestiona tareas de propiedades completamente migrado a GraphQL
 * - TaskResolver: Queries y Mutations GraphQL
 * - TaskService: Lógica de negocio (sin cambios)
 * - Relations: Property, User (assignedTo)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Property, User]),
    forwardRef(() => PropertyModule), // Necesario para field resolver 'property' (circular dependency)
    UserModule, // Necesario para field resolver 'assignedTo'
  ],
  providers: [TaskService, TaskResolver],
  // controllers: [TaskController], // REMOVED: Migrated to GraphQL
  exports: [TaskService],
})
export class TaskModule {}
