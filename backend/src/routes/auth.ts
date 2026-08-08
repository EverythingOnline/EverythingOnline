import { Router } from 'express';

const router = Router();

router.post('/register', async (req, res) => {
    res.status(201).json({ ok: true });
});

router.post('/login', async (req, res) => {
    res.json({ token: 'stub-token' });
});

export default router;
