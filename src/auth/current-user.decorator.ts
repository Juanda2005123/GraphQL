import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

interface AuthenticatedRequestUser {
  userId: string;
  email: string;
  role: string;
}

type AuthenticatedRequest = Request & { user?: AuthenticatedRequestUser };

interface GraphQLContext {
  req: AuthenticatedRequest;
}

export const CurrentUser = createParamDecorator(
  (
    data: unknown,
    context: ExecutionContext,
  ): AuthenticatedRequestUser | undefined => {
    // Intentar obtener contexto GraphQL
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphQLContext>();

    // Si existe request en GraphQL context, retornar user
    if (ctx?.req?.user) {
      return ctx.req.user;
    }

    // Si no, es REST, usar el método tradicional
    const httpRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    return httpRequest.user;
  },
);
