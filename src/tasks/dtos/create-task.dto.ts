import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class BaseTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Reparar puerta principal',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea',
    example: 'La puerta principal necesita ajuste en las bisagras',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'ID de la propiedad asociada',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  propertyId: string;
}

export class CreateTaskByAgentDto extends BaseTaskDto {}

export class CreateTaskByAdminDto extends BaseTaskDto {
  @ApiProperty({
    description: 'ID del usuario asignado a la tarea',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  assignedToId: string;
}
