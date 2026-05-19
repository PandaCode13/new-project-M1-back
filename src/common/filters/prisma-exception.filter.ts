import {
  Catch,
  ConflictException,
  ExceptionFilter,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

/**
 * Catches Prisma database errors and maps them to NestJS HTTP exceptions.
 *
 * WHY THIS EXISTS
 * NestJS has no built-in Prisma integration. Without this filter, any unhandled
 * Prisma error propagates as a 500 Internal Server Error, leaking a raw stack
 * trace to the client. This filter intercepts known Prisma error codes before
 * they reach the HTTP layer and converts them into meaningful responses.
 *
 * WHERE IT IS REGISTERED
 * Registered globally in main.ts via app.useGlobalFilters(). This means every
 * Prisma error thrown anywhere in the app — service, repository, wherever — is
 * caught here automatically. No try/catch needed in individual services.
 *
 * ALTERNATIVE
 * The community package `nestjs-prisma` ships a ready-made version of this exact
 * filter (PrismaClientExceptionFilter). It is identical in behavior; the only
 * difference is you don't write the code yourself. For learning purposes, having
 * it explicit here is intentional.
 *
 * PRISMA ERROR CODES REFERENCE
 * Full list: https://www.prisma.io/docs/orm/reference/error-reference
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      // Unique constraint violation — e.g. duplicate email, duplicate review
      case 'P2002':
        throw new ConflictException('A record with this value already exists');

      // Record not found — e.g. update/delete on a non-existent row
      case 'P2025':
        throw new NotFoundException('Record not found');

      // Foreign key constraint failed — e.g. referencing a parkId that does not exist
      case 'P2003':
        throw new BadRequestException('Related record not found');

      // Any other Prisma error is unexpected: let it bubble up as a 500
      default:
        throw exception;
    }
  }
}
