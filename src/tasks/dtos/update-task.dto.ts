import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskByAgentDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Reparar puerta principal - Actualizada',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea',
    example: 'Se ajustaron las bisagras y se lubricó la cerradura',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Indica si la tarea está completada',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateTaskByAdminDto extends UpdateTaskByAgentDto {
  @ApiProperty({
    description: 'ID de la nueva propiedad asociada',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({
    description: 'ID del nuevo usuario asignado',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
