import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
    const users = await prisma.user.findMany({ take: 20 });
    console.log('users', users.map((u) => ({ id: u.id, email: u.email, role: u.role })));
    const orders = await prisma.order.findMany({ take: 5 });
    console.log('orders', orders.map((o) => ({ id: o.id, status: o.status, paymentStatus: o.paymentStatus, total: o.total })));
    const adminUser = await prisma.user.findUnique({ where: { id: 'admin' } });
    console.log('adminUser', adminUser ? { id: adminUser.id, email: adminUser.email, role: adminUser.role } : null);
} catch (error) {
    console.error(error);
} finally {
    await prisma.$disconnect();
}
