import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';

@Injectable()
export class RoleQueryPipe implements PipeTransform {
  transform(value: unknown): Role | undefined {
    // Ajout IA: filtre optionnel, donc pas d'erreur si ?role est absent.
    if (value === undefined || value === '') {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('role must be a string');
    }

    if (!Object.values(Role).includes(value as Role)) {
      throw new BadRequestException(
        `role must be one of: ${Object.values(Role).join(', ')}`,
      );
    }

    return value as Role;
  }
}
