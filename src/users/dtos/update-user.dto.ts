import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/users/user.model';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez Actualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'nuevo_email@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'newpassword123',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @MinLength(8)
  password?: string;
}

export class UpdateUserByAdminDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Usuario Actualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'actualizado@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'newpassword123',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'superadmin',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
