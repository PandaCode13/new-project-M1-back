import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt } from 'better-auth/plugins/jwt';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  basePath: '/auth',
  advanced: {
    cookiePrefix: 'coasterplay',
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .filter(Boolean),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    // TODO: replace with a real email provider (Resend, SendGrid, Nodemailer…)
    // eslint-disable-next-line @typescript-eslint/require-await
    sendResetPassword: async ({ user, url }) => {
      console.log(`[DEV] Password reset link for ${user.email}: ${url}`);
    },
  },
  plugins: [
    // Adds GET /api/auth/token → short-lived JWT access token
    // The session cookie/token acts as the refresh token
    jwt(),
  ],
});
