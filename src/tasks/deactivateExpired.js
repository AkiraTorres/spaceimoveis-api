/* eslint-disable no-console */
import cron from 'node-cron';
import prisma from '../config/prisma.js';

async function deactivateExpiredAnnouncements() {
  const currentDate = new Date();

  try {
    // Find all entries where validUntil is today or earlier and active is true
    const expiredAnnouncement = await prisma.announcement.findMany({
      where: {
        validUntil: {
          lte: currentDate, // Less than or equal to current date
        },
        active: true,
      },
    });

    // Update active to false for expired entries
    const updatePromises = expiredAnnouncement.map((announcement) => prisma.announcement.update({
      where: { id: announcement.id },
      data: { active: false },
    }).then(() => {
      console.log(`Deactivated announcement with ID: ${announcement.id}`);
    }));

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error deactivating expired entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function startDeactivationTask() {
  cron.schedule('0 0 * * *', () => {
    console.log('Running deactivation task...');
    deactivateExpiredAnnouncements();
  });
  console.log('Scheduled task to deactivate expired entries.');
}

export default startDeactivationTask;
