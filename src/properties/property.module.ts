import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.model';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';
// import { PropertyController } from './property.controller'; // DEPRECATED: REST API removed
import { Task } from '../tasks/task.model';
import { User } from '../users/user.model';
import { UserModule } from '../users/user.module';
import { TaskModule } from '../tasks/task.module';

/**
 * Property Module - GraphQL Only
 *
 * Gestiona propiedades inmobiliarias completamente migrado a GraphQL
 * - PropertyResolver: Queries y Mutations GraphQL
 * - PropertyService: Lógica de negocio (sin cambios)
 * - Relations: User (owner), Task (completed migration)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Property, Task, User]),
    UserModule, // Necesario para field resolver 'owner'
    forwardRef(() => TaskModule), // Necesario para field resolver 'tasks' (circular dependency)
  ],
  providers: [PropertyService, PropertyResolver],
  // controllers: [PropertyController], // REMOVED: Migrated to GraphQL
  exports: [PropertyService],
})
export class PropertyModule {}
