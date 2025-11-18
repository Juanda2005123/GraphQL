import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.model';
// import { PropertyType } from '../../properties/dto/property.types';
// import { TaskType } from '../../tasks/dto/task.types';

/**
 * UserType - Representación GraphQL del modelo User
 * Excluye el campo password por seguridad
 */
@ObjectType('User', {
  description: 'Usuario del sistema con roles de autenticación',
})
export class UserType {
  @Field(() => ID, {
    description: 'Identificador único del usuario (UUID)',
  })
  id: string;

  @Field(() => String, {
    description: 'Nombre completo del usuario',
  })
  name: string;

  @Field(() => String, {
    description: 'Correo electrónico único del usuario',
  })
  email: string;

  @Field(() => String, {
    description: 'Rol del usuario en el sistema',
  })
  role: UserRole;

  @Field(() => Date, {
    description: 'Fecha de creación del usuario',
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Fecha de última actualización del usuario',
  })
  updatedAt: Date;

  @Field(() => Boolean, {
    description: 'Indica si el usuario ha sido eliminado (soft delete)',
  })
  isDeleted: boolean;

  /**
   * Relación OneToMany con Property
   * Este campo se resuelve mediante Field Resolver (@ResolveField)
   * Solo se carga si el cliente lo solicita en la query (lazy loading)
   *
   * NOTA: Comentado hasta que PropertyType esté disponible
   */
  // @Field(() => [PropertyType], {
  //   nullable: true,
  //   description: 'Lista de propiedades que pertenecen a este usuario',
  // })
  // properties?: PropertyType[];

  /**
   * Relación OneToMany con Task
   * Este campo se resuelve mediante Field Resolver (@ResolveField)
   * Solo se carga si el cliente lo solicita en la query (lazy loading)
   *
   * NOTA: Comentado hasta que TaskType esté disponible
   */
  // @Field(() => [TaskType], {
  //   nullable: true,
  //   description: 'Lista de tareas asignadas a este usuario',
  // })
  // tasks?: TaskType[];
}

// ==================== INPUT TYPES ====================

/**
 * CreateUserInput - Para que superadmin cree usuarios con cualquier rol
 */
@InputType({
  description: 'Datos para crear un nuevo usuario (solo superadmin)',
})
export class CreateUserInput {
  @Field(() => String, {
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, {
    description: 'Correo electrónico único del usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => String, {
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
  })
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @Field(() => String, {
    description: 'Rol del usuario en el sistema',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

/**
 * UpdateUserInput - Para que superadmin actualice cualquier usuario
 */
@InputType({
  description: 'Datos para actualizar un usuario (solo superadmin)',
})
export class UpdateUserInput {
  @Field(() => String, {
    nullable: true,
    description: 'Nombre completo del usuario',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Correo electrónico del usuario',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Nueva contraseña (mínimo 8 caracteres)',
  })
  @IsOptional()
  @MinLength(8)
  password?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Rol del usuario',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

/**
 * UpdateProfileInput - Para que usuarios actualicen su propio perfil
 * NO incluye campo role (usuarios no pueden cambiar su propio rol)
 */
@InputType({
  description: 'Datos para actualizar el perfil propio del usuario',
})
export class UpdateProfileInput {
  @Field(() => String, {
    nullable: true,
    description: 'Nombre completo del usuario',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Correo electrónico del usuario',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Nueva contraseña (mínimo 8 caracteres)',
  })
  @IsOptional()
  @MinLength(8)
  password?: string;
}

// ==================== RESPONSE TYPES ====================

/**
 * DeleteResponse - Respuesta para operaciones de eliminación
 */
@ObjectType({
  description: 'Respuesta de confirmación para operaciones de eliminación',
})
export class DeleteResponse {
  @Field(() => String, {
    description: 'Mensaje de confirmación',
  })
  message: string;
}
