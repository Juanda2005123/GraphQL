import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { UserRole } from 'src/users/user.model';

interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

interface JwtValidatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  validate(payload: JwtPayload): JwtValidatedUser {
    return { userId: payload.sub, email: payload.username, role: payload.role };
  }
}
