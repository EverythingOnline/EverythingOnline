import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (_req, res, next) => {
    try {
        const categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
        res.json({ data: categories });
    } catch (error) {
        next(error);
    }
});

export default router;