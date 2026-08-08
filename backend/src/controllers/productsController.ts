import type { Request, Response, NextFunction } from 'express';
import { getAllProducts, getProductById as findProductById } from '../models/productsModel.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const products = await getAllProducts();
        res.json({ data: products, meta: { total: products.length } });
    } catch (error) {
        next(error);
    }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const product = await findProductById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ data: product });
    } catch (error) {
        next(error);
    }
}
