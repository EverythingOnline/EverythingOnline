import type { Request, Response, NextFunction } from 'express';

export default function validateMpesaRequest(req: Request, res: Response, next: NextFunction) {
    const { productId, quantity, phoneNumber, amount } = req.body;
    if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'productId is required' });
    }
    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'quantity must be a number greater than 0' });
    }
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return res.status(400).json({ error: 'phoneNumber is required' });
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'amount must be a positive number' });
    }
    next();
}
