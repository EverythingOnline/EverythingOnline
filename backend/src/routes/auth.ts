import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
const AUTH_SECRET = process.env.JWT_SECRET ?? 'dev-admin-secret';

if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set. Using a default development secret. Set JWT_SECRET in production.');
}

async function ensureAdminUser() {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {
            name: 'Administrator',
            password: hashedPassword,
            role: 'admin',
        },
        create: {
            email: ADMIN_EMAIL,
            name: 'Administrator',
            password: hashedPassword,
            role: 'admin',
        },
    });
}

router.post('/register', async (req, res) => {
    res.status(201).json({ ok: true });
});

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

    await ensureAdminUser();
    const token = jwt.sign({ role: 'admin', id: adminUser.id }, AUTH_SECRET, { expiresIn: '2h' });
    res.json({ token });
});

export default router;
