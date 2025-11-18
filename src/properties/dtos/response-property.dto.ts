import { ApiProperty } from '@nestjs/swagger';

export class PropertyResponseDto {
  @ApiProperty({
    description: 'ID único de la propiedad',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Título de la propiedad',
    example: 'Casa moderna en el centro',
  })
  title: string;

  @ApiProperty({
    description: 'Descripción detallada',
    example: 'Hermosa casa de 3 pisos con acabados de lujo',
  })
  description: string;

  @ApiProperty({
    description: 'Precio de la propiedad',
    example: 250000,
  })
  price: number;

  @ApiProperty({
    description: 'Ubicación',
    example: 'Calle 123 #45-67, Bogotá',
  })
  location: string;

  @ApiProperty({
    description: 'Número de habitaciones',
    example: 3,
  })
  bedrooms: number;

  @ApiProperty({
    description: 'Número de baños',
    example: 2,
  })
  bathrooms: number;

  @ApiProperty({
    description: 'Área en metros cuadrados',
    example: 120,
  })
  area: number;

  @ApiProperty({
    description: 'URLs de las imágenes',
    example: ['https://example.com/image1.jpg'],
    type: [String],
  })
  imageUrls: string[];

  @ApiProperty({
    description: 'ID del propietario (agente)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  ownerId?: string; // Changed from string | null to string | undefined for GraphQL compatibility

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

export class PropertyListResponseDto {
  @ApiProperty({
    description: 'Lista de propiedades',
    type: [PropertyResponseDto],
  })
  properties: PropertyResponseDto[];

  @ApiProperty({
    description: 'Total de propiedades',
    example: 15,
  })
  total: number;
}
