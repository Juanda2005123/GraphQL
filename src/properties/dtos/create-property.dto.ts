import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class BasePropertyDto {
  @ApiProperty({
    description: 'Título de la propiedad',
    example: 'Casa moderna en el centro',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la propiedad',
    example: 'Hermosa casa de 3 pisos con acabados de lujo',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Precio de la propiedad',
    example: 250000,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Ubicación de la propiedad',
    example: 'Calle 123 #45-67, Bogotá',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Número de habitaciones',
    example: 3,
  })
  @IsNumber()
  @IsPositive()
  bedrooms: number;

  @ApiProperty({
    description: 'Número de baños',
    example: 2,
  })
  @IsNumber()
  @IsPositive()
  bathrooms: number;

  @ApiProperty({
    description: 'Área en metros cuadrados',
    example: 120,
  })
  @IsNumber()
  @IsPositive()
  area: number;

  @ApiProperty({
    description: 'URLs de las imágenes de la propiedad',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class CreatePropertyByAgentDto extends BasePropertyDto {}

export class CreatePropertyByAdminDto extends BasePropertyDto {
  @ApiProperty({
    description: 'ID del usuario propietario (agente)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}
