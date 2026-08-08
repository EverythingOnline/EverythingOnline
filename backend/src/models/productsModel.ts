import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ProductPayload = {
    name: string;
    slug: string;
    description: string;
    brand: string;
    price: number;
    originalPrice?: number;
    discount: number;
    rating: number;
    reviewCount: number;
    stock: number;
    images?: string | string[];
    nutrition: unknown;
    category: string;
};

function normalizeImages(images?: string | string[]) {
    if (!images) return '';
    if (Array.isArray(images)) return images[0] ?? '';
    return images
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)[0] ?? '';
}

function normalizeNutrition(nutrition: unknown) {
    if (typeof nutrition === 'string') {
        try {
            JSON.parse(nutrition);
            return nutrition;
        } catch {
            return JSON.stringify({ calories: '', protein: '', fat: '', carbs: '', ingredients: [] });
        }
    }

    return JSON.stringify(nutrition ?? { calories: '', protein: '', fat: '', carbs: '', ingredients: [] });
}

async function getCategoryId(categoryName: string) {
    const normalized = categoryName.trim();
    let category = await prisma.category.findUnique({ where: { name: normalized } });
    if (!category) {
        category = await prisma.category.create({ data: { name: normalized, slug: normalized.toLowerCase().replace(/\s+/g, '-') } });
    }
    return category.id;
}

function formatProduct(product: any) {
    return {
        ...product,
        category: product.category?.name ?? 'Unknown',
        images: typeof product.images === 'string' ? [product.images] : product.images,
        nutrition: typeof product.nutrition === 'string' ? JSON.parse(product.nutrition) : product.nutrition,
    };
}

export async function getAllProducts() {
    const products = await prisma.product.findMany({ include: { category: true } });
    return products.map(formatProduct);
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!product) return null;
    return formatProduct(product);
}

export async function createNewProduct(data: ProductPayload) {
    const categoryId = await getCategoryId(data.category);
    const product = await prisma.product.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            brand: data.brand,
            price: data.price,
            originalPrice: data.originalPrice ?? data.price,
            discount: data.discount,
            rating: data.rating,
            reviewCount: data.reviewCount,
            stock: data.stock,
            images: normalizeImages(data.images),
            nutrition: normalizeNutrition(data.nutrition),
            categoryId,
        },
        include: { category: true },
    });
    return formatProduct(product);
}

export async function updateProduct(id: string, data: Partial<ProductPayload>) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;

    const updateData: any = {
        ...data,
    };

    if (data.category) {
        updateData.categoryId = await getCategoryId(data.category);
        delete updateData.category;
    }

    if (data.images !== undefined) {
        updateData.images = normalizeImages(data.images);
    }

    if (data.nutrition !== undefined) {
        updateData.nutrition = normalizeNutrition(data.nutrition);
    }

    const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true },
    });

    return formatProduct(updated);
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } });
}
