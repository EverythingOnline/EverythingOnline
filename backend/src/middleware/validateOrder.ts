import type { Request, Response, NextFunction } from 'express';

export default function validateOrder(req: Request, res: Response, next: NextFunction) {
    const { productId, quantity, customerPhone } = req.body;
    if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'productId is required' });
    }
    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'quantity must be a number greater than 0' });
    }
    if (!customerPhone || typeof customerPhone !== 'string') {
        return res.status(400).json({ error: 'customerPhone is required' });
    }
    next();
}
