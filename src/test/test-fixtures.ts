import { TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { ParksService } from '../parks/parks.service';
import { RollerCoastersService } from '../roller-coasters/roller-coasters.service';

/**
 * Central fixture factory — one place to define seed data for all integration tests.
 *
 * Each fixture function creates a real record in the test database and returns it.
 * Defaults are deliberately minimal so each test only overrides what it cares about.
 *
 * Usage:
 *   const fixtures = buildFixtures(module);
 *   const user = await fixtures.user();
 *   const park = await fixtures.park({ isActive: false });
 *   const rc   = await fixtures.rollerCoaster(park.id, { isOperational: false });
 */
export function buildFixtures(module: TestingModule) {
  const usersService = module.get(UsersService);
  const parksService = module.get(ParksService);
  const rcService = module.get(RollerCoastersService);

  return {
    user(override?: { email?: string; firstName?: string; lastName?: string }) {
      return usersService.create({
        email: override?.email ?? 'alice@test.com',
        firstName: override?.firstName ?? 'Alice',
        lastName: override?.lastName ?? 'Smith',
      });
    },

    park(override?: {
      name?: string;
      city?: string;
      country?: string;
      isActive?: boolean;
    }) {
      return parksService.create({
        name: override?.name ?? 'Parc Astérix',
        city: override?.city ?? 'Plailly',
        country: override?.country ?? 'France',
        isActive: override?.isActive ?? true,
      });
    },

    rollerCoaster(
      parkId: string,
      override?: {
        name?: string;
        heightRequirementCm?: number;
        maxSpeedKmh?: number;
        thrillLevel?: number;
        isOperational?: boolean;
      },
    ) {
      return rcService.create({
        parkId,
        name: override?.name ?? 'Tonnerre de Zeus',
        heightRequirementCm: override?.heightRequirementCm ?? 120,
        maxSpeedKmh: override?.maxSpeedKmh ?? 85,
        thrillLevel: override?.thrillLevel ?? 4,
        isOperational: override?.isOperational ?? true,
      });
    },
  };
}
