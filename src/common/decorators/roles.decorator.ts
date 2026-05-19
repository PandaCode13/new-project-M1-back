import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';

/**
 * TYPE 2 — SetMetadata
 *
 * SetMetadata attaches arbitrary data to a route handler or controller class.
 * That data is later read by a Guard (or Interceptor) via the Reflector service.
 *
 * This is the NestJS way to implement role-based access control (RBAC):
 * 1. Annotate routes with @Roles('admin')
 * 2. In a RolesGuard, read the metadata with Reflector and compare to req.user.roles
 *
 * The key ('roles') is a contract between the decorator and the guard.
 * Using a const avoids typos between the two sides.
 *
 * Usage:
 *   @Roles('admin')
 *   @Delete(':id')
 *   remove(...) { ... }
 *
 * In RolesGuard (not implemented here, left as exercise):
 *   const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
 *     context.getHandler(),
 *     context.getClass(),
 *   ]);
 *   if (!required) return true; // no roles required — public route
 *   return required.some(role => user.roles.includes(role));
 */
export const ROLES_KEY = 'roles';
// Ajout IA: typage des roles avec l'enum Prisma pour eviter les valeurs invalides.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
