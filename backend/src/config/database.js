import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
});

export default prisma; 