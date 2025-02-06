import { PrismaClient } from '@prisma/client';

const dbUrl = encodeURI(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

prisma.$connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
});

export default prisma; 