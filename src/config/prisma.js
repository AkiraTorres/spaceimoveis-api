import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  transactionOptions: {
    timeout: 60000,
  },
});

// Exclude keys from an object
export function excludeFromObject(obj, keys) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
}

// Exclude keys from objects in a list
export function excludeFromList(objects, keysToDelete) {
  return objects.map((obj) => excludeFromObject(obj, keysToDelete));
}

export default prisma;
