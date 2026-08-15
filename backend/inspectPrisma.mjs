import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
    const users = await prisma.user.findMany({ take: 20 });
    console.log('users', JSON.stringify(users.map((u) => ({ id: u.id, email: u.email }))));
    const orders = await prisma.order.findMany({ take: 5 });
    console.log('orders', JSON.stringify(orders.map((o) => ({ id: o.id, status: o.status, paymentStatus: o.paymentStatus }))));
    const payments = await prisma.payment.findMany({ take: 5 });
    console.log('payments', JSON.stringify(payments.map((p) => ({ id: p.id, orderId: p.orderId, reviewedById: p.reviewedById, status: p.status }))));
    const adminUser = await prisma.user.findUnique({ where: { id: 'admin' } });
    console.log('adminUser', adminUser ? { id: adminUser.id, email: adminUser.email } : null);
} catch (error) {
    console.error(error);
} finally {
    await prisma.$disconnect();
}
