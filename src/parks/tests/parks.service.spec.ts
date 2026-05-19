import { NotFoundException } from '@nestjs/common';
import { ParksService } from '../parks.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  setupTestDb,
  teardownTestDb,
  cleanDatabase,
  TestContext,
} from '../../test/setup-test-db';
import { buildFixtures } from '../../test/test-fixtures';

jest.setTimeout(60_000);

describe('ParksService (integration)', () => {
  let ctx: TestContext;
  let service: ParksService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    service = ctx.module.get(ParksService);
    prisma = ctx.prisma;
    fixtures = buildFixtures(ctx.module);
  });

  afterAll(() => teardownTestDb(ctx));

  beforeEach(() => cleanDatabase(prisma));

  describe('create', () => {
    it('persists a new park and returns it with an id', async () => {
      const park = await service.create({
        name: 'Europa-Park',
        city: 'Rust',
        country: 'Germany',
      });

      expect(park.id).toBeDefined();
      expect(park.name).toBe('Europa-Park');
      expect(park.isActive).toBe(true);
    });
  });

  describe('findAll', () => {
    it('returns all parks ordered alphabetically', async () => {
      await fixtures.park({ name: 'Walibi' });
      await fixtures.park({ name: 'Alton Towers' });
      await fixtures.park({ name: 'Phantasialand' });

      const parks = await service.findAll();

      expect(parks).toHaveLength(3);
      expect(parks[0].name).toBe('Alton Towers');
      expect(parks[2].name).toBe('Walibi');
    });

    it('returns an empty array when no parks exist', async () => {
      const parks = await service.findAll();
      expect(parks).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('returns the park by id', async () => {
      const created = await fixtures.park();
      const found = await service.findOne(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Parc Astérix');
    });

    it('throws NotFoundException for a non-existent id', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates the requested fields and leaves the rest unchanged', async () => {
      const park = await fixtures.park();
      const updated = await service.update(park.id, { city: 'Paris' });

      expect(updated.city).toBe('Paris');
      expect(updated.name).toBe('Parc Astérix'); // unchanged
    });

    it('can deactivate a park', async () => {
      const park = await fixtures.park();
      const updated = await service.update(park.id, { isActive: false });

      expect(updated.isActive).toBe(false);
    });

    it('throws NotFoundException for a non-existent id', async () => {
      await expect(
        service.update('00000000-0000-0000-0000-000000000000', { city: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the park so findOne throws afterwards', async () => {
      const park = await fixtures.park();
      await service.remove(park.id);

      await expect(service.findOne(park.id)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when park does not exist', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRollerCoasters', () => {
    it('returns all roller coasters for a park', async () => {
      const park = await fixtures.park();
      await fixtures.rollerCoaster(park.id);
      await fixtures.rollerCoaster(park.id, { isOperational: false });

      const all = await service.findRollerCoasters(park.id);
      expect(all).toHaveLength(2);
    });

    it('filters by isOperational=true', async () => {
      const park = await fixtures.park();
      await fixtures.rollerCoaster(park.id, { isOperational: true });
      await fixtures.rollerCoaster(park.id, { isOperational: false });

      const operational = await service.findRollerCoasters(park.id, true);

      expect(operational).toHaveLength(1);
      expect(operational[0].isOperational).toBe(true);
    });

    it('filters by isOperational=false', async () => {
      const park = await fixtures.park();
      await fixtures.rollerCoaster(park.id, { isOperational: true });
      await fixtures.rollerCoaster(park.id, { isOperational: false });

      const closed = await service.findRollerCoasters(park.id, false);

      expect(closed).toHaveLength(1);
      expect(closed[0].isOperational).toBe(false);
    });

    it('does not mix roller coasters across parks', async () => {
      const parkA = await fixtures.park({ name: 'Park A' });
      const parkB = await fixtures.park({ name: 'Park B' });
      await fixtures.rollerCoaster(parkA.id);
      await fixtures.rollerCoaster(parkB.id);

      const result = await service.findRollerCoasters(parkA.id);
      expect(result).toHaveLength(1);
    });

    it('throws NotFoundException when the park does not exist', async () => {
      await expect(
        service.findRollerCoasters('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
