import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run every minute to catch stale payments older than 5 minutes
cron.schedule('* * * * *', async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const payments = await prisma.payment.findMany({ where: { status: 'PENDING', createdAt: { lt: fiveMinutesAgo } } });
        for (const p of payments) {
            await prisma.payment.update({ where: { id: p.id }, data: { status: 'EXPIRED' } });
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error expiring payments', e);
    }
});

export default {};
