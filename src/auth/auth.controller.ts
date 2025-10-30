import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import {
  AuthResponseDto,
  UserResponseDto,
} from 'src/users/dtos/response-user.dto';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve un token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Devuelve token JWT y datos del usuario',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Crea un nuevo usuario con rol de agente',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o email ya registrado',
  })
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Cierra la sesión del usuario (el cliente debe descartar el token JWT)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  logout(): { message: string } {
    return this.authService.logout();
  }
}
