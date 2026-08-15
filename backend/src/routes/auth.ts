import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
const AUTH_SECRET = process.env.JWT_SECRET ?? 'dev-admin-secret';

if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set. Using a default development secret. Set JWT_SECRET in production.');
}

async function ensureAdminUser() {
    await prisma.user.upsert({
        where: { id: 'admin' },
        update: {},
        create: {
            id: 'admin',
            email: 'admin@example.com',
            name: 'Administrator',
            password: ADMIN_PASSWORD,
            role: 'admin',
        },
    });
}

router.post('/register', async (req, res) => {
    res.status(201).json({ ok: true });
});

router.post('/login', async (req, res) => {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required' });
    }
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    await ensureAdminUser();
    const token = jwt.sign({ role: 'admin', id: 'admin' }, AUTH_SECRET, { expiresIn: '2h' });
    res.json({ token });
});

export default router;
