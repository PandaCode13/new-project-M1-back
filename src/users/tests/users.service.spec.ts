import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  setupTestDb,
  teardownTestDb,
  cleanDatabase,
  TestContext,
} from '../../test/setup-test-db';
import { buildFixtures } from '../../test/test-fixtures';

jest.setTimeout(60_000);

describe('UsersService (integration)', () => {
  let ctx: TestContext;
  let service: UsersService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    service = ctx.module.get(UsersService);
    prisma = ctx.prisma;
    fixtures = buildFixtures(ctx.module);
  });

  afterAll(() => teardownTestDb(ctx));

  beforeEach(() => cleanDatabase(prisma));

  describe('create', () => {
    it('persists a new user and returns it with an id', async () => {
      const user = await service.create({
        email: 'bob@test.com',
        firstName: 'Bob',
        lastName: 'Martin',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('bob@test.com');
      expect(user.firstName).toBe('Bob');
      expect(user.lastName).toBe('Martin');
    });

    it('throws ConflictException when email is already taken', async () => {
      await fixtures.user();

      await expect(
        service.create({
          email: 'alice@test.com',
          firstName: 'Other',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects a second account with the same email regardless of spacing', async () => {
      await fixtures.user();

      await expect(
        service.create({
          email: 'alice@test.com',
          firstName: 'Alice',
          lastName: 'Two',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll (offset pagination)', () => {
    it('returns paginated users with correct metadata', async () => {
      await fixtures.user({ email: 'u1@test.com' });
      await fixtures.user({ email: 'u2@test.com' });
      await fixtures.user({ email: 'u3@test.com' });

      const result = await service.findAll({ page: 1, limit: 2, skip: 0 });

      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(2);
      expect(result.totalPages).toBe(2);
      expect(result.page).toBe(1);
    });

    it('returns an empty page when no users exist', async () => {
      const result = await service.findAll({ page: 1, limit: 10, skip: 0 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
      const created = await fixtures.user();
      const found = await service.findOne(created.id);

      expect(found?.id).toBe(created.id);
    });

    it('returns null for a non-existent id', async () => {
      const found = await service.findOne(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('updates only the provided fields', async () => {
      const user = await fixtures.user();
      const updated = await service.update(user.id, { firstName: 'Alicia' });

      expect(updated.firstName).toBe('Alicia');
      expect(updated.lastName).toBe('Smith'); // unchanged
    });

    it('throws NotFoundException for a non-existent id', async () => {
      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          firstName: 'X',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the user so it no longer appears in the DB', async () => {
      const user = await fixtures.user();
      await service.remove(user.id);

      const found = await service.findOne(user.id);
      expect(found).toBeNull();
    });

    it('throws NotFoundException when user does not exist', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addToWishlist', () => {
    it('adds an active park to the user wishlist', async () => {
      const user = await fixtures.user();
      const park = await fixtures.park();

      await service.addToWishlist(user.id, park.id);
      const wishlist = await service.getWishlist(user.id);

      expect(wishlist).toHaveLength(1);
      expect(wishlist[0].id).toBe(park.id);
    });

    it('throws BadRequestException when the park is inactive', async () => {
      const user = await fixtures.user();
      const inactive = await fixtures.park({ isActive: false });

      await expect(service.addToWishlist(user.id, inactive.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when the park does not exist', async () => {
      const user = await fixtures.user();

      await expect(
        service.addToWishlist(user.id, '00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromWishlist', () => {
    it('removes a park from the wishlist', async () => {
      const user = await fixtures.user();
      const park = await fixtures.park();

      await service.addToWishlist(user.id, park.id);
      await service.removeFromWishlist(user.id, park.id);
      const wishlist = await service.getWishlist(user.id);

      expect(wishlist).toHaveLength(0);
    });

    it('is idempotent — removing a park not in the wishlist does not throw', async () => {
      const user = await fixtures.user();
      const park = await fixtures.park();

      await expect(
        service.removeFromWishlist(user.id, park.id),
      ).resolves.not.toThrow();
    });
  });
});
