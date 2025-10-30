import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/users/user.model';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'agent',
    enum: UserRole,
  })
  role: UserRole;

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

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT para autenticación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total de usuarios',
    example: 10,
  })
  total: number;
}
