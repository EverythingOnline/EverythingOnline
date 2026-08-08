import type { Request, Response, NextFunction } from 'express';
import { createNewProduct, deleteProduct, getAllProducts, updateProduct } from '../models/productsModel.js';
import { getOrders } from '../models/ordersModel.js';
import { getPayments } from '../models/paymentsModel.js';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const products = await getAllProducts();
        res.json({ data: products, meta: { total: products.length } });
    } catch (error) {
        next(error);
    }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const product = await createNewProduct(req.body);
        res.status(201).json({ data: product });
    } catch (error) {
        next(error);
    }
}

export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const product = await updateProduct(id, req.body);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ data: product });
    } catch (error) {
        next(error);
    }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await deleteProduct(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const status = req.query.status as string | undefined;
        const orders = await getOrders(status);
        res.json({ data: orders });
    } catch (error) {
        next(error);
    }
}

export async function listPayments(req: Request, res: Response, next: NextFunction) {
    try {
        const payments = await getPayments();
        res.json({ data: payments });
    } catch (error) {
        next(error);
    }
}
