import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { listPayments } from '../controllers/adminController.js';
import { listPendingPayments, approvePayment, rejectPayment } from '../controllers/adminPaymentsController.js';
import requireAdminAuth from '../middleware/adminAuth.js';

const router = Router();
const prisma = new PrismaClient();
const AUTH_SECRET = process.env.JWT_SECRET ?? 'dev-admin-secret';

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const adminUser = await prisma.user.findUnique({ where: { email } });
    if (!adminUser || adminUser.role !== 'admin') {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password).catch(() => false);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ role: 'admin', id: adminUser.id }, AUTH_SECRET, { expiresIn: '2h' });
    return res.json({ token });
});

router.use(requireAdminAuth);

router.get('/payments', listPayments);
router.get('/payments/pending', listPendingPayments);
router.post('/payments/:id/approve', approvePayment);
router.post('/payments/:id/reject', rejectPayment);

export default router;
