
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}


export const prisma = globalForPrisma.prisma || (() => {
    console.log('--- Initializing Prisma Client ---');
    console.log('--- DATABASE_URL:', process.env.DATABASE_URL);
    return new PrismaClient();
})();


if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


