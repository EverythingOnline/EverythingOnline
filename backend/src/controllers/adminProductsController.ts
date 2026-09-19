import type { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://localhost:4000';

function routeId(req: Request) {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function parseProductInput(body: Record<string, unknown>) {
    const name = String(body.name ?? '').trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const lowStockThreshold = Number(body.lowStockThreshold ?? 5);
    const categoryId = String(body.categoryId ?? '').trim();

    if (!name) return { error: 'Name is required.' };
    if (!Number.isFinite(price) || price < 0) return { error: 'Price must be a non-negative number.' };
    if (!Number.isInteger(stock) || stock < 0) return { error: 'Stock must be a non-negative integer.' };
    if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) return { error: 'Low stock threshold must be a non-negative whole number.' };
    if (!categoryId) return { error: 'Category is required.' };

    return {
        data: {
            name,
            price,
            stock,
            lowStockThreshold,
            categoryId,
            description: String(body.description ?? ''),
            active: body.active === undefined ? true : body.active === 'true' || body.active === true,
        },
    };
}

const productInclude = { category: { select: { id: true, name: true } } } as const;

export async function listAdminProducts(_req: Request, res: Response, next: NextFunction) {
    try {
        const products = await prisma.product.findMany({ include: productInclude, orderBy: { createdAt: 'desc' } });
        res.json({ data: products, meta: { total: products.length } });
    } catch (error) {
        next(error);
    }
}

export async function getAdminProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const product = await prisma.product.findUnique({ where: { id: routeId(req) }, include: productInclude });
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json({ data: product });
    } catch (error) {
        next(error);
    }
}

export async function createAdminProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = parseProductInput(req.body);
        if ('error' in parsed) return res.status(400).json({ error: parsed.error });

        const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
        if (!category) return res.status(400).json({ error: 'Category not found.' });

        const file = req.file as Express.Multer.File | undefined;
        const imageUrl = file ? `${backendOrigin}/uploads/${file.filename}` : null;
        const product = await prisma.product.create({
            data: {
                ...parsed.data,
                slug: `${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`,
                brand: '',
                discount: 0,
                nutrition: '{}',
                images: imageUrl ?? '',
                imageUrl,
            },
            include: productInclude,
        });
        res.status(201).json({ data: product });
    } catch (error) {
        next(error);
    }
}

export async function updateAdminProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const existing = await prisma.product.findUnique({ where: { id: routeId(req) } });
        if (!existing) return res.status(404).json({ error: 'Product not found.' });

        const parsed = parseProductInput(req.body);
        if ('error' in parsed) return res.status(400).json({ error: parsed.error });
        const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
        if (!category) return res.status(400).json({ error: 'Category not found.' });

        const file = req.file as Express.Multer.File | undefined;
        const image = file ? `${backendOrigin}/uploads/${file.filename}` : existing.imageUrl;
        const product = await prisma.product.update({
            where: { id: existing.id },
            data: { ...parsed.data, imageUrl: image, images: file ? image ?? '' : existing.images },
            include: productInclude,
        });
        res.json({ data: product });
    } catch (error) {
        next(error);
    }
}

export async function removeAdminProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const product = await prisma.product.update({ where: { id: routeId(req) }, data: { active: false }, include: productInclude });
        res.json({ data: product });
    } catch (error) {
        next(error);
    }
}

export async function restoreAdminProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const product = await prisma.product.update({ where: { id: routeId(req) }, data: { active: true }, include: productInclude });
        res.json({ data: product });
    } catch (error) {
        next(error);
    }
}