import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePropertyByAgentDto {
  @ApiProperty({
    description: 'Título de la propiedad',
    example: 'Casa moderna actualizada',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Descripción detallada de la propiedad',
    example: 'Descripción actualizada con nuevas características',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Precio de la propiedad',
    example: 280000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Ubicación de la propiedad',
    example: 'Calle 150 #20-30, Bogotá',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Número de habitaciones',
    example: 4,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiProperty({
    description: 'Número de baños',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiProperty({
    description: 'Área en metros cuadrados',
    example: 150,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiProperty({
    description: 'URLs de las imágenes de la propiedad',
    example: ['https://example.com/new1.jpg'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class UpdatePropertyByAdminDto extends UpdatePropertyByAgentDto {
  @ApiProperty({
    description: 'ID del nuevo propietario (agente)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerId?: string;
}
