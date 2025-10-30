import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserRole } from 'src/users/user.model';
import {
  AuthResponseDto,
  UserResponseDto,
} from 'src/users/dtos/response-user.dto';
import type { SafeUser } from 'src/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _password, ...safeUser } = user;
      void _password;
      return safeUser;
    }
    return null;
  }

  login(user: SafeUser): AuthResponseDto {
    const payload = { username: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: this.userService.toResponseDto(user),
    };
  }

  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    const existing = await this.userService.findByEmail(dto.email, {
      includeDeleted: true,
    });

    if (existing && !existing.isDeleted) {
      throw new UnauthorizedException('User already exists');
    }

    if (existing && existing.isDeleted) {
      await this.userService.restore(existing.id);
      const revived = await this.userService.update(existing.id, {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: UserRole.AGENT,
      });

      if (!revived) {
        throw new UnauthorizedException('Unable to restore user');
      }

      return this.userService.toResponseDto(revived);
    }

    const newUser = await this.userService.create({
      ...dto,
      role: UserRole.AGENT,
    });
    return this.userService.toResponseDto(newUser);
  }

  logout(): { message: string } {
    return {
      message: 'Session terminated. Please discard the JWT on the client.',
    };
  }
}
