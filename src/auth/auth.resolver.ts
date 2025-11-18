import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import {
  LoginInput,
  RegisterInput,
  AuthResponse,
  LogoutResponse,
  UserType,
} from './dto/auth.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String, {
    description: 'Health check para GraphQL',
  })
  @Public()
  healthCheck(): string {
    return 'GraphQL API is running!';
  }

  @Mutation(() => AuthResponse, {
    description: 'Iniciar sesión con email y contraseña',
  })
  @Public()
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    const user = await this.authService.validateUser(
      input.email,
      input.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Mutation(() => AuthResponse, {
    description: 'Registrar un nuevo usuario con rol de agente',
  })
  @Public()
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return await this.authService.register(input);
  }

  @Mutation(() => LogoutResponse, {
    description: 'Cerrar sesión (el cliente debe descartar el token JWT)',
  })
  logout(): LogoutResponse {
    return this.authService.logout();
  }
}
