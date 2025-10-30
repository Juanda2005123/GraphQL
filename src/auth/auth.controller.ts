import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  AuthResponseDto,
  UserResponseDto,
} from 'src/users/dtos/response-user.dto';

@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
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
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(): { message: string } {
    return this.authService.logout();
  }
}
