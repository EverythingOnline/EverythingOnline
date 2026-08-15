import type { Request, Response, NextFunction } from 'express';
import { createNewProduct, deleteProduct, getAllProducts, updateProduct } from '../models/productsModel.js';
import { getOrders } from '../models/ordersModel.js';
import * as paymentsModel from '../models/paymentsModel.js';

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
        const paymentStatus = req.query.paymentStatus as string | undefined;
        const paymentMethod = req.query.paymentMethod as string | undefined;
        const page = Number(req.query.page ?? 1);
        const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);

        const filters = { status, paymentStatus, paymentMethod, page, pageSize };
        const result = await getOrders(filters);
        res.json({ data: result.orders, meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
    } catch (error) {
        next(error);
    }
}

export async function listPayments(req: Request, res: Response, next: NextFunction) {
    try {
        const payments = await paymentsModel.getPendingPayments();
        res.json({ data: payments });
    } catch (error) {
        next(error);
    }
}
