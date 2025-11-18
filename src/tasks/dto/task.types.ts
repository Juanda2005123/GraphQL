import { Field, ObjectType, InputType, Int, ID } from '@nestjs/graphql';
import { PropertyType } from '../../properties/dto/property.types';
import { UserType } from '../../users/dto/user.types';

// ============ OBJECT TYPES ============

/**
 * Tipo GraphQL para Task
 * Representa una tarea asociada a una propiedad y asignada a un usuario
 */
@ObjectType('TaskGQL', {
  description: 'Tarea de mantenimiento o gestión de propiedad',
})
export class TaskType {
  @Field(() => ID, { description: 'Identificador único de la tarea' })
  id: string;

  @Field({ description: 'Título de la tarea' })
  title: string;

  @Field({ description: 'Descripción detallada de la tarea' })
  description: string;

  @Field({ description: 'Estado de completitud de la tarea' })
  isCompleted: boolean;

  @Field(() => ID, {
    nullable: true,
    description: 'ID de la propiedad asociada',
  })
  propertyId?: string;

  @Field(() => ID, { nullable: true, description: 'ID del usuario asignado' })
  assignedToId?: string;

  // Field resolvers (se implementan en el resolver)
  @Field(() => PropertyType, {
    nullable: true,
    description: 'Propiedad asociada a la tarea',
  })
  property?: PropertyType;

  @Field(() => UserType, {
    nullable: true,
    description: 'Usuario asignado a la tarea',
  })
  assignedTo?: UserType;

  @Field({ description: 'Fecha de creación de la tarea' })
  createdAt: Date;

  @Field({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}

/**
 * Response type para lista de tareas con conteo total
 */
@ObjectType('TaskList', {
  description: 'Lista de tareas con información de paginación',
})
export class TaskListType {
  @Field(() => [TaskType], { description: 'Array de tareas' })
  tasks: TaskType[];

  @Field(() => Int, { description: 'Número total de tareas' })
  total: number;
}

// ============ INPUT TYPES ============

/**
 * Input para crear tarea como agente (agent)
 * El agente autenticado se asigna automáticamente como assignedTo
 */
@InputType('CreateTaskByAgentInput', {
  description: 'Datos para crear tarea como agente (auto-asignación)',
})
export class CreateTaskByAgentInput {
  @Field({ description: 'Título de la tarea' })
  title: string;

  @Field({ description: 'Descripción de la tarea' })
  description: string;

  @Field(() => ID, {
    description: 'ID de la propiedad asociada (debe ser del agente)',
  })
  propertyId: string;
}

/**
 * Input para crear tarea como admin (superadmin)
 * Permite especificar el usuario asignado explícitamente
 */
@InputType('CreateTaskByAdminInput', {
  description: 'Datos para crear tarea como admin con assignedToId',
})
export class CreateTaskByAdminInput extends CreateTaskByAgentInput {
  @Field(() => ID, { description: 'ID del usuario asignado (debe ser AGENT)' })
  assignedToId: string;
}

/**
 * Input para actualizar tarea como agente
 * Todos los campos son opcionales
 */
@InputType('UpdateTaskByAgentInput', {
  description: 'Datos para actualizar tarea como agente',
})
export class UpdateTaskByAgentInput {
  @Field({ nullable: true, description: 'Nuevo título' })
  title?: string;

  @Field({ nullable: true, description: 'Nueva descripción' })
  description?: string;

  @Field({ nullable: true, description: 'Nuevo estado de completitud' })
  isCompleted?: boolean;
}

/**
 * Input para actualizar tarea como admin
 * Incluye capacidad de cambiar la propiedad y el asignado
 */
@InputType('UpdateTaskByAdminInput', {
  description: 'Datos para actualizar tarea como admin (incluye reasignación)',
})
export class UpdateTaskByAdminInput extends UpdateTaskByAgentInput {
  @Field(() => ID, { nullable: true, description: 'Nuevo ID de la propiedad' })
  propertyId?: string;

  @Field(() => ID, {
    nullable: true,
    description: 'Nuevo ID del usuario asignado',
  })
  assignedToId?: string;
}

// ============ FRAGMENT DOCUMENTATION ============

/**
 * FRAGMENT: TaskBasicFields
 *
 * Campos básicos de una tarea (sin relaciones)
 *
 * @example
 * ```graphql
 * fragment TaskBasicFields on Task {
 *   id
 *   title
 *   description
 *   isCompleted
 *   propertyId
 *   assignedToId
 *   createdAt
 *   updatedAt
 * }
 * ```
 *
 * FRAGMENT: TaskWithProperty
 *
 * Tarea con información de la propiedad asociada
 *
 * @example
 * ```graphql
 * fragment TaskWithProperty on Task {
 *   ...TaskBasicFields
 *   property {
 *     id
 *     title
 *     location
 *     price
 *   }
 * }
 * ```
 *
 * FRAGMENT: TaskWithAssignee
 *
 * Tarea con información del usuario asignado
 *
 * @example
 * ```graphql
 * fragment TaskWithAssignee on Task {
 *   ...TaskBasicFields
 *   assignedTo {
 *     id
 *     name
 *     email
 *     role
 *   }
 * }
 * ```
 *
 * FRAGMENT: TaskFull
 *
 * Tarea completa con propiedad y usuario asignado
 *
 * @example
 * ```graphql
 * fragment TaskFull on Task {
 *   ...TaskBasicFields
 *   property {
 *     id
 *     title
 *     location
 *     owner {
 *       name
 *     }
 *   }
 *   assignedTo {
 *     id
 *     name
 *     email
 *     role
 *   }
 * }
 * ```
 *
 * Uso en queries:
 * ```graphql
 * query GetMyTasks {
 *   myTasks {
 *     tasks {
 *       ...TaskBasicFields
 *     }
 *     total
 *   }
 * }
 *
 * query GetTaskFull($id: ID!) {
 *   myTask(id: $id) {
 *     ...TaskFull
 *   }
 * }
 * ```
 */
