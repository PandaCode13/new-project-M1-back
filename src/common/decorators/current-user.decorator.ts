import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * TYPE 1b — createParamDecorator
 *
 * createParamDecorator is used when you need to extract something from the
 * request that NestJS doesn't expose natively via @Param/@Query/@Body.
 * The factory receives:
 *   - data    = the argument passed to the decorator
 *   - context = gives access to req, res, and the handler metadata
 *
 * In a real app with JWT auth, a Guard decodes the token and attaches the
 * user object to req.user. This decorator then reads req.user cleanly,
 * without touching JWT logic in every controller.
 *
 * Usage (once a JWT guard populates req.user):
 *   @Get('me')
 *   getProfile(@CurrentUser() user: UserPayload) { ... }
 *
 *   @Get('me/email')
 *   getEmail(@CurrentUser('email') email: string) { ... }
 *
 * The `data` argument allows picking a specific field from the user object,
 * mirroring how @Param('id') picks a field from req.params.
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: Record<string, unknown> }).user;

    return field ? user?.[field] : user;
  },
);
