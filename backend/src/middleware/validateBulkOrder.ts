import type { Request, Response, NextFunction } from 'express';

export default function validateBulkOrder(req: Request, res: Response, next: NextFunction) {
    const { items, customerPhone } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            return res.status(400).json({ error: 'each item must be an object' });
        }
        if (!item.productId || typeof item.productId !== 'string') {
            return res.status(400).json({ error: 'productId is required for each item' });
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
            return res.status(400).json({ error: 'quantity must be a positive number for each item' });
        }
    }

    if (!customerPhone || typeof customerPhone !== 'string') {
        return res.status(400).json({ error: 'customerPhone is required' });
    }

    next();
}
