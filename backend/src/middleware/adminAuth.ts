import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const AUTH_SECRET = process.env.JWT_SECRET ?? 'dev-admin-secret';

export default function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, AUTH_SECRET) as { role?: string; id?: string };
        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        (req as Request & { user?: { id?: string } }).user = payload;
        return next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
