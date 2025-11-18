import {
  Resolver,
  Query,
  Args,
  Mutation,
  // ResolveField,
  // Parent,
} from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserType,
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  DeleteResponse,
} from './dto/user.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.model';
// import { Property } from '../properties/property.model';
// import { Task } from '../tasks/task.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';

interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * ==================== FRAGMENTS GRAPHQL RECOMENDADOS ====================
 *
 * Los Fragments en GraphQL permiten reutilizar conjuntos de campos comunes
 * en múltiples queries y mutations, evitando repetición de código.
 *
 * Fragment: UserBasicFields
 * --------------------------
 * Define los campos básicos de un usuario que se usan frecuentemente.
 * Incluye información esencial sin datos sensibles ni relaciones pesadas.
 *
 * Definición del Fragment:
 * ------------------------
 * fragment UserBasicFields on User {
 *   id
 *   name
 *   email
 *   role
 *   createdAt
 *   updatedAt
 *   isDeleted
 * }
 *
 * Ejemplo de uso en Query 'me':
 * ------------------------------
 * query GetMyProfile {
 *   me {
 *     ...UserBasicFields
 *   }
 * }
 *
 * Ejemplo de uso en Query 'users':
 * ---------------------------------
 * query GetAllUsers {
 *   users {
 *     ...UserBasicFields
 *   }
 * }
 *
 * Ejemplo de uso en Mutation 'createUser':
 * -----------------------------------------
 * mutation CreateNewUser($input: CreateUserInput!) {
 *   createUser(input: $input) {
 *     ...UserBasicFields
 *   }
 * }
 *
 * Ejemplo combinando Fragment con campos adicionales:
 * ---------------------------------------------------
 * query GetUserWithRelations($id: String!) {
 *   user(id: $id) {
 *     ...UserBasicFields
 *     properties {
 *       id
 *       title
 *       price
 *     }
 *     tasks {
 *       id
 *       description
 *       isCompleted
 *     }
 *   }
 * }
 *
 * Ventajas de usar Fragments:
 * ---------------------------
 * 1. DRY (Don't Repeat Yourself): Define campos una vez, úsalos muchas veces
 * 2. Mantenibilidad: Si necesitas cambiar los campos, solo lo haces en un lugar
 * 3. Consistencia: Todos los queries usan los mismos campos base
 * 4. Legibilidad: El código de las queries es más limpio y expresivo
 * 5. Type Safety: Los clientes GraphQL (Apollo, Relay) generan tipos TypeScript
 *    automáticamente desde los fragments
 *
 * Nota: Los fragments se definen en el CLIENTE (frontend), no en el servidor
 */

/**
 * UserResolver - Maneja todas las operaciones GraphQL relacionadas con usuarios
 */
@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    // @InjectRepository(Property)
    // private readonly propertyRepo: Repository<Property>,
    // @InjectRepository(Task)
    // private readonly taskRepo: Repository<Task>,
  ) {}

  /**
   * Query: me
   * Retorna el perfil del usuario autenticado actual
   * Accesible para cualquier usuario autenticado (agent o superadmin)
   */
  @Query(() => UserType, {
    description: 'Obtener el perfil del usuario autenticado actual',
  })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserType> {
    const currentUser = await this.userService.findOne(user.userId);

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    return currentUser as UserType;
  }

  /**
   * Query: users
   * Lista todos los usuarios del sistema
   * Accesible para CUALQUIER usuario autenticado (agent o superadmin)
   * SIN restricción de roles - cumple con el requisito del enunciado
   */
  @Query(() => [UserType], {
    description:
      'Lista de todos los usuarios - accesible para cualquier usuario autenticado',
  })
  async users(): Promise<UserType[]> {
    const allUsers = await this.userService.findAll();
    return allUsers as UserType[];
  }

  /**
   * Query: user
   * Obtiene un usuario específico por ID
   * Solo accesible para superadmin
   */
  @Query(() => UserType, {
    description: 'Obtener un usuario específico por ID (solo superadmin)',
  })
  @Roles(UserRole.SUPERADMIN)
  async user(@Args('id') id: string): Promise<UserType> {
    const foundUser = await this.userService.findOne(id);

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return foundUser as UserType;
  }

  // ==================== MUTATIONS DE SUPERADMIN ====================

  /**
   * Mutation: createUser
   * Crea un nuevo usuario con cualquier rol
   * Solo accesible para superadmin
   */
  @Mutation(() => UserType, {
    description: 'Crear un nuevo usuario con cualquier rol (solo superadmin)',
  })
  @Roles(UserRole.SUPERADMIN)
  async createUser(@Args('input') input: CreateUserInput): Promise<UserType> {
    return this.userService.create(input);
  }

  /**
   * Mutation: updateUser
   * Actualiza cualquier usuario por ID
   * Solo accesible para superadmin
   */
  @Mutation(() => UserType, {
    description: 'Actualizar cualquier usuario por ID (solo superadmin)',
  })
  @Roles(UserRole.SUPERADMIN)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserType> {
    const updatedUser = await this.userService.update(id, input);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser as UserType;
  }

  /**
   * Mutation: deleteUser
   * Elimina (soft delete) cualquier usuario por ID
   * Solo accesible para superadmin
   */
  @Mutation(() => DeleteResponse, {
    description: 'Eliminar (soft delete) un usuario por ID (solo superadmin)',
  })
  @Roles(UserRole.SUPERADMIN)
  async deleteUser(@Args('id') id: string): Promise<DeleteResponse> {
    await this.userService.remove(id);
    return {
      message: `Usuario con ID ${id} eliminado exitosamente`,
    };
  }

  // ==================== MUTATIONS DE USUARIOS REGULARES ====================

  /**
   * Mutation: updateProfile
   * Permite a cualquier usuario autenticado actualizar su propio perfil
   * No requiere rol específico - accesible para agent y superadmin
   * No permite cambiar el rol (campo role no está en UpdateProfileInput)
   */
  @Mutation(() => UserType, {
    description: 'Actualizar el perfil propio del usuario autenticado',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UpdateProfileInput,
  ): Promise<UserType> {
    const updatedUser = await this.userService.updateProfile(
      user.userId,
      input,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser as UserType;
  }

  /**
   * Mutation: deleteProfile
   * Permite a cualquier usuario autenticado eliminar su propia cuenta
   * No requiere rol específico - accesible para agent y superadmin
   */
  @Mutation(() => DeleteResponse, {
    description:
      'Eliminar (soft delete) la cuenta propia del usuario autenticado',
  })
  async deleteProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DeleteResponse> {
    await this.userService.remove(user.userId);
    return {
      message: 'Tu cuenta ha sido eliminada exitosamente',
    };
  }

  // ==================== FIELD RESOLVERS ====================

  /**
   * Field Resolver: properties
   * Carga las propiedades (Property[]) del usuario cuando se solicitan en la query
   *
   * ¿Por qué es necesario?
   * - TypeORM no carga automáticamente las relaciones OneToMany por defecto
   * - Esto permite LAZY LOADING: solo se ejecuta si el cliente pide el campo 'properties'
   * - Optimiza el rendimiento: si no se pide 'properties', no hace la query a la DB
   *
   * Ejemplo de uso:
   * query {
   *   me {
   *     id
   *     name
   *     properties {  ← Este campo dispara el Field Resolver
   *       id
   *       title
   *       price
   *     }
   *   }
   * }
   *
   * NOTA: Comentado hasta que el módulo Properties esté migrado a GraphQL
   */
  /*
  @ResolveField('properties', () => [PropertyType], {
    description: 'Lista de propiedades que pertenecen a este usuario',
  })
  async properties(@Parent() user: UserType): Promise<PropertyType[]> {
    const properties = await this.propertyRepo.find({
      where: {
        owner: { id: user.id },
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
    });
    return properties as PropertyType[];
  }
  */

  /**
   * Field Resolver: tasks
   * Carga las tareas (Task[]) asignadas al usuario cuando se solicitan en la query
   *
   * Mismo principio que el resolver anterior:
   * - Solo se ejecuta si el cliente solicita el campo 'tasks' en la query
   * - Filtra por isDeleted: false para excluir tareas eliminadas
   * - Ordena por fecha de creación descendente
   *
   * NOTA: Comentado hasta que el módulo Tasks esté migrado a GraphQL
   */
  /*
  @ResolveField('tasks', () => [TaskType], {
    description: 'Lista de tareas asignadas a este usuario',
  })
  async tasks(@Parent() user: UserType): Promise<TaskType[]> {
    const tasks = await this.taskRepo.find({
      where: {
        assignedTo: { id: user.id },
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
    });
    return tasks as TaskType[];
  }
  */
}
