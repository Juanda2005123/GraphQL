import { Field, ObjectType, InputType, Int, Float, ID } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.types';

// Forward declaration para evitar circular dependency
// TaskType se importa dinámicamente en el resolver
@ObjectType('Task')
class TaskTypeReference {
  @Field(() => ID)
  id: string;
}

// ============ OBJECT TYPES ============

/**
 * Tipo GraphQL para Property
 * Representa una propiedad inmobiliaria con sus detalles y relaciones
 */
@ObjectType('Property', {
  description: 'Propiedad inmobiliaria con detalles completos',
})
export class PropertyType {
  @Field(() => ID, { description: 'Identificador único de la propiedad' })
  id: string;

  @Field({ description: 'Título descriptivo de la propiedad' })
  title: string;

  @Field({ description: 'Descripción detallada de la propiedad' })
  description: string;

  @Field(() => Float, { description: 'Precio de la propiedad en USD' })
  price: number;

  @Field({ description: 'Ubicación/dirección de la propiedad' })
  location: string;

  @Field(() => Int, { description: 'Número de habitaciones' })
  bedrooms: number;

  @Field(() => Int, { description: 'Número de baños' })
  bathrooms: number;

  @Field(() => Float, { description: 'Área en metros cuadrados' })
  area: number;

  @Field(() => [String], {
    description: 'URLs de las imágenes de la propiedad',
  })
  imageUrls: string[];

  @Field(() => ID, { nullable: true, description: 'ID del propietario' })
  ownerId?: string;

  // Field resolvers (se implementan en el resolver)
  @Field(() => UserType, {
    nullable: true,
    description: 'Usuario propietario de la propiedad',
  })
  owner?: UserType;

  @Field(() => [TaskTypeReference], {
    description: 'Tareas asociadas a la propiedad',
  })
  tasks?: TaskTypeReference[];

  @Field({ description: 'Fecha de creación de la propiedad' })
  createdAt: Date;

  @Field({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}

/**
 * Response type para lista de propiedades con conteo total
 */
@ObjectType('PropertyList', {
  description: 'Lista de propiedades con información de paginación',
})
export class PropertyListType {
  @Field(() => [PropertyType], { description: 'Array de propiedades' })
  properties: PropertyType[];

  @Field(() => Int, { description: 'Número total de propiedades' })
  total: number;
}

// ============ INPUT TYPES ============

/**
 * Input para crear propiedad como agente (agent)
 * El agente autenticado se asigna automáticamente como owner
 */
@InputType('CreatePropertyByAgentInput', {
  description: 'Datos para crear propiedad como agente',
})
export class CreatePropertyByAgentInput {
  @Field({ description: 'Título de la propiedad' })
  title: string;

  @Field({ description: 'Descripción de la propiedad' })
  description: string;

  @Field(() => Float, { description: 'Precio en USD' })
  price: number;

  @Field({ description: 'Ubicación de la propiedad' })
  location: string;

  @Field(() => Int, { description: 'Número de habitaciones' })
  bedrooms: number;

  @Field(() => Int, { description: 'Número de baños' })
  bathrooms: number;

  @Field(() => Float, { description: 'Área en m²' })
  area: number;

  @Field(() => [String], {
    nullable: true,
    description: 'URLs de imágenes (opcional)',
  })
  imageUrls?: string[];
}

/**
 * Input para crear propiedad como admin (superadmin)
 * Permite especificar el propietario explícitamente
 */
@InputType('CreatePropertyByAdminInput', {
  description: 'Datos para crear propiedad como admin con ownerId',
})
export class CreatePropertyByAdminInput extends CreatePropertyByAgentInput {
  @Field(() => ID, { description: 'ID del usuario propietario' })
  ownerId: string;
}

/**
 * Input para actualizar propiedad como agente
 * Todos los campos son opcionales
 */
@InputType('UpdatePropertyByAgentInput', {
  description: 'Datos para actualizar propiedad como agente',
})
export class UpdatePropertyByAgentInput {
  @Field({ nullable: true, description: 'Nuevo título' })
  title?: string;

  @Field({ nullable: true, description: 'Nueva descripción' })
  description?: string;

  @Field(() => Float, { nullable: true, description: 'Nuevo precio' })
  price?: number;

  @Field({ nullable: true, description: 'Nueva ubicación' })
  location?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Nuevo número de habitaciones',
  })
  bedrooms?: number;

  @Field(() => Int, { nullable: true, description: 'Nuevo número de baños' })
  bathrooms?: number;

  @Field(() => Float, { nullable: true, description: 'Nueva área' })
  area?: number;

  @Field(() => [String], {
    nullable: true,
    description: 'Nuevas URLs de imágenes',
  })
  imageUrls?: string[];
}

/**
 * Input para actualizar propiedad como admin
 * Incluye capacidad de cambiar el propietario
 */
@InputType('UpdatePropertyByAdminInput', {
  description:
    'Datos para actualizar propiedad como admin (incluye cambio de owner)',
})
export class UpdatePropertyByAdminInput extends UpdatePropertyByAgentInput {
  @Field(() => ID, { nullable: true, description: 'Nuevo ID del propietario' })
  ownerId?: string;
}

// ============ FRAGMENT DOCUMENTATION ============

/**
 * FRAGMENT: PropertyBasicFields
 *
 * Campos básicos de una propiedad (sin relaciones)
 *
 * @example
 * ```graphql
 * fragment PropertyBasicFields on Property {
 *   id
 *   title
 *   description
 *   price
 *   location
 *   bedrooms
 *   bathrooms
 *   area
 *   imageUrls
 *   ownerId
 *   createdAt
 *   updatedAt
 * }
 * ```
 *
 * FRAGMENT: PropertyWithOwner
 *
 * Propiedad con información del propietario
 *
 * @example
 * ```graphql
 * fragment PropertyWithOwner on Property {
 *   ...PropertyBasicFields
 *   owner {
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
 * query GetProperties {
 *   properties {
 *     properties {
 *       ...PropertyBasicFields
 *     }
 *     total
 *   }
 * }
 *
 * query GetPropertyWithOwner($id: ID!) {
 *   property(id: $id) {
 *     ...PropertyWithOwner
 *   }
 * }
 * ```
 */
