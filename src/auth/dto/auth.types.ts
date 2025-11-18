import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// ==================== INPUT TYPES ====================

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'Correo electrónico del usuario' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'Contraseña del usuario' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

@InputType()
export class RegisterInput {
  @Field(() => String, { description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => String, { description: 'Contraseña del usuario' })
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

// ==================== OBJECT TYPES ====================

@ObjectType()
export class UserType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  role: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class AuthResponse {
  @Field(() => String, { description: 'Token JWT de autenticación' })
  token: string;

  @Field(() => UserType, { description: 'Datos del usuario autenticado' })
  user: UserType;
}

@ObjectType()
export class LogoutResponse {
  @Field(() => String)
  message: string;
}
