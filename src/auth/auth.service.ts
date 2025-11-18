import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterInput, AuthResponse } from './dto/auth.types';
import { UserRole } from 'src/users/user.model';
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

  login(user: SafeUser): AuthResponse {
    const payload = { username: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(dto: RegisterInput): Promise<AuthResponse> {
    const existing = await this.userService.findByEmail(dto.email, {
      includeDeleted: true,
    });

    if (existing && !existing.isDeleted) {
      throw new UnauthorizedException('User already exists');
    }

    let user: SafeUser;

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

      user = revived;
    } else {
      const newUser = await this.userService.create({
        ...dto,
        role: UserRole.AGENT,
      });
      user = newUser;
    }

    // Retornar token JWT junto con usuario
    return this.login(user);
  }

  logout(): { message: string } {
    return {
      message: 'Session terminated. Please discard the JWT on the client.',
    };
  }
}
