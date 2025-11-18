import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { PropertyService } from '../properties/property.service';
import { UserService } from '../users/user.service';
import {
  TaskType,
  TaskListType,
  CreateTaskByAgentInput,
  CreateTaskByAdminInput,
  UpdateTaskByAgentInput,
  UpdateTaskByAdminInput,
} from './dto/task.types';
import { PropertyType } from '../properties/dto/property.types';
import { UserType } from '../users/dto/user.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole } from '../users/user.model';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * GraphQL Resolver para el módulo de Tasks
 *
 * Gestiona todas las operaciones CRUD de tareas:
 * - Queries para agentes (solo sus tareas)
 * - Queries para admins (todas las tareas)
 * - Mutations para agentes (crear/actualizar/eliminar sus tareas)
 * - Mutations para admins (gestionar cualquier tarea)
 * - Field resolvers para cargar relaciones (property, assignedTo)
 */
@Resolver(() => TaskType)
export class TaskResolver {
  constructor(
    private readonly taskService: TaskService,
    private readonly propertyService: PropertyService,
    private readonly userService: UserService,
  ) {}

  // ============ QUERIES (AGENT) ============

  /**
   * Query: myTasks
   * Lista todas las tareas del agente autenticado
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   *
   * @returns TaskListType con tareas asignadas al agente
   *
   * @example
   * ```graphql
   * query GetMyTasks {
   *   myTasks {
   *     tasks {
   *       id
   *       title
   *       isCompleted
   *     }
   *     total
   *   }
   * }
   * ```
   */
  @Query(() => TaskListType, {
    name: 'myTasks',
    description: 'Lista todas las tareas del agente autenticado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async getMyTasks(@CurrentUser() user: JwtPayload): Promise<TaskListType> {
    return this.taskService.listForAgent(user.userId);
  }

  /**
   * Query: myTask
   * Obtiene una tarea específica del agente autenticado
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   * @requires Ownership: Solo puede ver sus propias tareas
   *
   * @throws ForbiddenException si la tarea no pertenece al agente
   */
  @Query(() => TaskType, {
    name: 'myTask',
    description: 'Obtiene una tarea específica del agente autenticado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async getMyTask(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TaskType> {
    return this.taskService.getForAgent(id, user.userId);
  }

  /**
   * Query: tasksByProperty
   * Lista tareas de una propiedad del agente autenticado
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   * @requires Ownership: Solo puede ver tareas de sus propiedades
   */
  @Query(() => TaskListType, {
    name: 'tasksByProperty',
    description: 'Lista tareas de una propiedad del agente',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async getTasksByProperty(
    @CurrentUser() user: JwtPayload,
    @Args('propertyId', { type: () => ID }) propertyId: string,
  ): Promise<TaskListType> {
    return this.taskService.listByPropertyForAgent(propertyId, user.userId);
  }

  // ============ QUERIES (ADMIN) ============

  /**
   * Query: allTasks
   * Lista todas las tareas del sistema
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   */
  @Query(() => TaskListType, {
    name: 'allTasks',
    description: 'Lista todas las tareas del sistema (admin)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async getAllTasks(): Promise<TaskListType> {
    return this.taskService.listForAdmin();
  }

  /**
   * Query: task
   * Obtiene cualquier tarea por ID
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   */
  @Query(() => TaskType, {
    name: 'task',
    description: 'Obtiene cualquier tarea por ID (admin)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async getTask(@Args('id', { type: () => ID }) id: string): Promise<TaskType> {
    return this.taskService.getForAdmin(id);
  }

  /**
   * Query: tasksByPropertyAdmin
   * Lista tareas de cualquier propiedad
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   */
  @Query(() => TaskListType, {
    name: 'tasksByPropertyAdmin',
    description: 'Lista tareas de cualquier propiedad (admin)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async getTasksByPropertyAdmin(
    @Args('propertyId', { type: () => ID }) propertyId: string,
  ): Promise<TaskListType> {
    return this.taskService.listByPropertyForAdmin(propertyId);
  }

  // ============ MUTATIONS (AGENT) ============

  /**
   * Mutation: createTaskByAgent
   * Crea una tarea asignada al agente autenticado
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   * @requires Ownership: Solo puede crear tareas en sus propiedades
   *
   * @example
   * ```graphql
   * mutation CreateTask($input: CreateTaskByAgentInput!) {
   *   createTaskByAgent(input: $input) {
   *     id
   *     title
   *     propertyId
   *   }
   * }
   * ```
   */
  @Mutation(() => TaskType, {
    name: 'createTaskByAgent',
    description: 'Crear tarea como agente (auto-asignación)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async createTaskByAgent(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateTaskByAgentInput,
  ): Promise<TaskType> {
    return this.taskService.createForAgent(user.userId, input);
  }

  /**
   * Mutation: updateTaskByAgent
   * Actualiza una tarea propia del agente
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   * @requires Ownership: Solo puede actualizar sus propias tareas
   */
  @Mutation(() => TaskType, {
    name: 'updateTaskByAgent',
    description: 'Actualizar tarea propia como agente',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async updateTaskByAgent(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTaskByAgentInput,
  ): Promise<TaskType> {
    return this.taskService.updateForAgent(id, user.userId, input);
  }

  /**
   * Mutation: deleteTaskByAgent
   * Elimina (soft delete) una tarea propia del agente
   *
   * @requires Role: AGENT
   * @requires Authentication: JWT
   * @requires Ownership: Solo puede eliminar sus propias tareas
   */
  @Mutation(() => Boolean, {
    name: 'deleteTaskByAgent',
    description: 'Eliminar (soft delete) tarea propia como agente',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  async deleteTaskByAgent(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.taskService.removeForAgent(id, user.userId);
    return true;
  }

  // ============ MUTATIONS (ADMIN) ============

  /**
   * Mutation: createTaskByAdmin
   * Crea tarea asignando cualquier usuario
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   *
   * @example
   * ```graphql
   * mutation CreateTaskAdmin($input: CreateTaskByAdminInput!) {
   *   createTaskByAdmin(input: $input) {
   *     id
   *     title
   *     assignedToId
   *   }
   * }
   * ```
   */
  @Mutation(() => TaskType, {
    name: 'createTaskByAdmin',
    description: 'Crear tarea como admin especificando el asignado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async createTaskByAdmin(
    @Args('input') input: CreateTaskByAdminInput,
  ): Promise<TaskType> {
    return this.taskService.createForAdmin(input);
  }

  /**
   * Mutation: updateTaskByAdmin
   * Actualiza cualquier tarea, incluyendo reasignación
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   */
  @Mutation(() => TaskType, {
    name: 'updateTaskByAdmin',
    description: 'Actualizar cualquier tarea como admin (puede reasignar)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async updateTaskByAdmin(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTaskByAdminInput,
  ): Promise<TaskType> {
    return this.taskService.updateForAdmin(id, input);
  }

  /**
   * Mutation: deleteTaskByAdmin
   * Elimina (soft delete) cualquier tarea
   *
   * @requires Role: SUPERADMIN
   * @requires Authentication: JWT
   */
  @Mutation(() => Boolean, {
    name: 'deleteTaskByAdmin',
    description: 'Eliminar (soft delete) cualquier tarea como admin',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async deleteTaskByAdmin(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.taskService.removeForAdmin(id);
    return true;
  }

  // ============ FIELD RESOLVERS ============

  /**
   * Field Resolver: property
   * Carga la propiedad asociada a la tarea
   *
   * @param task - TaskType parent object
   * @returns PropertyType | null
   *
   * @example
   * ```graphql
   * query {
   *   myTask(id: "...") {
   *     title
   *     property {
   *       title
   *       location
   *     }
   *   }
   * }
   * ```
   */
  @ResolveField(() => PropertyType, {
    nullable: true,
    description: 'Propiedad asociada a la tarea',
  })
  async property(@Parent() task: TaskType): Promise<PropertyType | null> {
    if (!task.propertyId) return null;
    return this.propertyService.getPublicById(task.propertyId);
  }

  /**
   * Field Resolver: assignedTo
   * Carga el usuario asignado a la tarea
   *
   * @param task - TaskType parent object
   * @returns UserType | null
   *
   * @example
   * ```graphql
   * query {
   *   myTask(id: "...") {
   *     title
   *     assignedTo {
   *       name
   *       email
   *     }
   *   }
   * }
   * ```
   */
  @ResolveField(() => UserType, {
    nullable: true,
    description: 'Usuario asignado a la tarea',
  })
  async assignedTo(@Parent() task: TaskType): Promise<UserType | null> {
    if (!task.assignedToId) return null;
    return this.userService.findOne(task.assignedToId);
  }
}
