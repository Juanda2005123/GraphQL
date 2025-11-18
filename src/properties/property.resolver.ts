import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { UserService } from '../users/user.service';
import { TaskService } from '../tasks/task.service';
import {
  PropertyType,
  PropertyListType,
  CreatePropertyByAgentInput,
  CreatePropertyByAdminInput,
  UpdatePropertyByAgentInput,
  UpdatePropertyByAdminInput,
} from './dto/property.types';
import { UserType } from '../users/dto/user.types';
import { TaskType } from '../tasks/dto/task.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole } from '../users/user.model';
import { Public } from '../auth/public.decorator';
import { UseGuards } from '@nestjs/common';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * GraphQL Resolver para el módulo de Properties
 *
 * Gestiona todas las operaciones CRUD de propiedades inmobiliarias:
 * - Queries públicas para listar y ver propiedades
 * - Mutations para agentes (crear/actualizar/eliminar sus propias propiedades)
 * - Mutations para admins (gestionar cualquier propiedad)
 * - Field resolvers para cargar relaciones (owner, tasks)
 */
@Resolver(() => PropertyType)
export class PropertyResolver {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly userService: UserService,
    private readonly taskService: TaskService,
  ) {}

  // ============ PUBLIC QUERIES ============

  /**
   * Query: properties
   * Lista todas las propiedades activas (público, sin autenticación)
   *
   * @returns PropertyListType con array de propiedades y total
   *
   * @example
   * ```graphql
   * query GetProperties {
   *   properties {
   *     properties {
   *       id
   *       title
   *       price
   *       location
   *     }
   *     total
   *   }
   * }
   * ```
   */
  @Query(() => PropertyListType, {
    name: 'properties',
    description: 'Lista todas las propiedades activas (acceso público)',
  })
  @Public()
  async getProperties(): Promise<PropertyListType> {
    return this.propertyService.listPublic();
  }

  /**
   * Query: property
   * Obtiene una propiedad específica por ID (público, sin autenticación)
   *
   * @param id - UUID de la propiedad
   * @returns PropertyType con todos los detalles
   *
   * @example
   * ```graphql
   * query GetProperty($id: ID!) {
   *   property(id: $id) {
   *     id
   *     title
   *     description
   *     price
   *     owner {
   *       name
   *       email
   *     }
   *   }
   * }
   * ```
   */
  @Query(() => PropertyType, {
    name: 'property',
    description: 'Obtiene una propiedad por ID (acceso público)',
  })
  @Public()
  async getProperty(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PropertyType> {
    return this.propertyService.getPublicById(id);
  }

  // ============ AGENT MUTATIONS ============

  /**
   * Mutation: createPropertyByAgent
   * Crea una nueva propiedad asignada al agente autenticado
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   *
   * @example
   * ```graphql
   * mutation CreateProperty($input: CreatePropertyByAgentInput!) {
   *   createPropertyByAgent(input: $input) {
   *     id
   *     title
   *     price
   *     ownerId
   *   }
   * }
   * ```
   */
  @Mutation(() => PropertyType, {
    name: 'createPropertyByAgent',
    description:
      'Crear propiedad como agente (se asigna automáticamente como owner)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async createPropertyByAgent(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreatePropertyByAgentInput,
  ): Promise<PropertyType> {
    return this.propertyService.createForAgent(user.userId, input);
  }

  /**
   * Mutation: updatePropertyByAgent
   * Actualiza una propiedad propia del agente autenticado
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   * @requires Ownership: Solo puede actualizar sus propias propiedades
   *
   * @throws ForbiddenException si el agente no es el propietario
   */
  @Mutation(() => PropertyType, {
    name: 'updatePropertyByAgent',
    description: 'Actualizar propiedad propia como agente',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async updatePropertyByAgent(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePropertyByAgentInput,
  ): Promise<PropertyType> {
    return this.propertyService.updateForAgent(id, input, user.userId);
  }

  /**
   * Mutation: deletePropertyByAgent
   * Elimina (soft delete) una propiedad propia del agente
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   * @requires Ownership: Solo puede eliminar sus propias propiedades
   *
   * @throws ForbiddenException si el agente no es el propietario
   */
  @Mutation(() => Boolean, {
    name: 'deletePropertyByAgent',
    description: 'Eliminar (soft delete) propiedad propia como agente',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async deletePropertyByAgent(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.propertyService.removeForAgent(id, user.userId);
    return true;
  }

  // ============ ADMIN MUTATIONS ============

  /**
   * Mutation: createPropertyByAdmin
   * Crea propiedad asignando cualquier usuario como propietario
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   *
   * @example
   * ```graphql
   * mutation CreatePropertyAdmin($input: CreatePropertyByAdminInput!) {
   *   createPropertyByAdmin(input: $input) {
   *     id
   *     title
   *     ownerId
   *   }
   * }
   * ```
   */
  @Mutation(() => PropertyType, {
    name: 'createPropertyByAdmin',
    description: 'Crear propiedad como admin especificando el propietario',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async createPropertyByAdmin(
    @Args('input') input: CreatePropertyByAdminInput,
  ): Promise<PropertyType> {
    return this.propertyService.createForAdmin(input);
  }

  /**
   * Mutation: updatePropertyByAdmin
   * Actualiza cualquier propiedad, incluyendo cambio de propietario
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   */
  @Mutation(() => PropertyType, {
    name: 'updatePropertyByAdmin',
    description:
      'Actualizar cualquier propiedad como admin (puede cambiar owner)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async updatePropertyByAdmin(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePropertyByAdminInput,
  ): Promise<PropertyType> {
    return this.propertyService.updateForAdmin(id, input);
  }

  /**
   * Mutation: deletePropertyByAdmin
   * Elimina (soft delete) cualquier propiedad
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   */
  @Mutation(() => Boolean, {
    name: 'deletePropertyByAdmin',
    description: 'Eliminar (soft delete) cualquier propiedad como admin',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async deletePropertyByAdmin(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.propertyService.removeForAdmin(id);
    return true;
  }

  // ============ FIELD RESOLVERS ============

  /**
   * Field Resolver: owner
   * Carga el usuario propietario de la propiedad
   *
   * @param property - PropertyType parent object
   * @returns UserType | null
   *
   * @example
   * ```graphql
   * query {
   *   property(id: "...") {
   *     title
   *     owner {
   *       name
   *       email
   *     }
   *   }
   * }
   * ```
   */
  @ResolveField(() => UserType, {
    nullable: true,
    description: 'Usuario propietario de la propiedad',
  })
  async owner(@Parent() property: PropertyType): Promise<UserType | null> {
    if (!property.ownerId) return null;
    return this.userService.findOne(property.ownerId);
  }

  /**
   * Field Resolver: tasks
   * Carga las tareas asociadas a la propiedad
   *
   * @param property - PropertyType parent object
   * @returns TaskType[]
   *
   * @example
   * ```graphql
   * query {
   *   property(id: "...") {
   *     title
   *     tasks {
   *       id
   *       title
   *       isCompleted
   *       assignedTo {
   *         name
   *       }
   *     }
   *   }
   * }
   * ```
   */
  @ResolveField(() => [TaskType], {
    description: 'Tareas asociadas a la propiedad',
  })
  async tasks(@Parent() property: PropertyType): Promise<TaskType[]> {
    const result = await this.taskService.listByPropertyForAdmin(property.id);
    return result.tasks;
  }
}
