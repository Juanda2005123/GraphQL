import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserRole } from 'src/users/user.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(dto: RegisterUserDto) {
    const exists = await this.userService.findByEmail(dto.email);
    if (exists) {
      throw new UnauthorizedException('User already exists');
    }
    const agent = UserRole.AGENT;
    //Its agent by default ;)
    // Hashear password antes de guardar
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
      role: agent,
    });
    return { id: newUser.id, email: newUser.email, role: newUser.role };
  }
}
