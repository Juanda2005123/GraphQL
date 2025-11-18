import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

import { ROLES_KEY } from './roles.decorator';

interface AuthenticatedRequestUser {
  role?: string;
}

type AuthenticatedRequest = Request & { user?: AuthenticatedRequestUser };

interface GraphQLContext {
  req: AuthenticatedRequest;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    // Obtener request desde REST o GraphQL
    const request = this.getRequest(context);
    const userRole = request.user?.role;

    if (!userRole) {
      throw new UnauthorizedException();
    }

    return requiredRoles.includes(userRole);
  }

  private getRequest(context: ExecutionContext): AuthenticatedRequest {
    // Intentar obtener contexto GraphQL
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphQLContext>();

    // Si existe request en GraphQL context, usarlo
    if (ctx?.req) {
      return ctx.req;
    }

    // Si no, es REST, usar el método tradicional
    return context.switchToHttp().getRequest<AuthenticatedRequest>();
  }
}
