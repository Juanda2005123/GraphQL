import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/users/user.model';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'María García',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'maria@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'password123',
    minLength: 8,
  })
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'agent',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
