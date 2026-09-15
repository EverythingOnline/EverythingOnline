import type { Request, Response, NextFunction } from 'express';

export default function validateMpesaRequest(req: Request, res: Response, next: NextFunction) {
    const { orderId, productId, quantity, phoneNumber, amount } = req.body;

    const hasOrderContext = !!orderId || !!productId;

    if (orderId !== undefined && (typeof orderId !== 'string' || !orderId.trim())) {
        return res.status(400).json({ error: 'orderId must be a non-empty string' });
    }

    if (!orderId && (!productId || typeof productId !== 'string')) {
        return res.status(400).json({ error: 'orderId or productId is required' });
    }

    if (orderId && productId && typeof productId !== 'string') {
        return res.status(400).json({ error: 'productId must be a string when provided' });
    }

    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1)) {
        return res.status(400).json({ error: 'quantity must be a number greater than 0' });
    }

    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return res.status(400).json({ error: 'phoneNumber is required' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'amount must be a positive number' });
    }

    if (!hasOrderContext) {
        return res.status(400).json({ error: 'orderId or productId is required' });
    }

    next();
}
