import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({
    description: 'ID único de la tarea',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Reparar puerta principal',
  })
  title: string;

  @ApiProperty({
    description: 'Descripción detallada',
    example: 'La puerta principal necesita ajuste en las bisagras',
  })
  description: string;

  @ApiProperty({
    description: 'Estado de completitud de la tarea',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'ID de la propiedad asociada',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  propertyId?: string; // Changed from string | null to string | undefined for GraphQL compatibility

  @ApiProperty({
    description: 'ID del usuario asignado',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  assignedToId?: string; // Changed from string | null to string | undefined for GraphQL compatibility

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class TaskListResponseDto {
  @ApiProperty({
    description: 'Lista de tareas',
    type: [TaskResponseDto],
  })
  tasks: TaskResponseDto[];

  @ApiProperty({
    description: 'Total de tareas',
    example: 8,
  })
  total: number;
}
