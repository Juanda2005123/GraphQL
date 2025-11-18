import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.model';
import { Property } from '../properties/property.model';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

/**
 * UserModule - Módulo de usuarios migrado completamente a GraphQL
 * 
 * REST API eliminado - Toda la funcionalidad ahora a través de GraphQL
 * - Queries: me, users, user(id)
 * - Mutations (Superadmin): createUser, updateUser, deleteUser
 * - Mutations (Usuarios): updateProfile, deleteProfile
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, Property])],
  providers: [UserService, UserResolver],
  controllers: [], // REST API eliminado - Solo GraphQL
  exports: [UserService],
})
export class UserModule {}
