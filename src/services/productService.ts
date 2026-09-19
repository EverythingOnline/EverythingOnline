import type { Product } from '../types/product';
import { products } from '../data/products';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type BackendProduct = Omit<Product, 'images' | 'nutrition'> & {
    images: string[];
    nutrition: Product['nutrition'];
};

function mergeWithLocalData(product: BackendProduct): Product {
    const fallback = products.find((item) => item.slug === product.slug);
    return {
        ...(fallback ?? {}),
        ...product,
        category: product.category,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        images: product.images ?? fallback?.images ?? [],
        nutrition: {
            calories: product.nutrition?.calories ?? fallback?.nutrition.calories ?? '',
            protein: product.nutrition?.protein ?? fallback?.nutrition.protein ?? '',
            fat: product.nutrition?.fat ?? fallback?.nutrition.fat ?? '',
            carbs: product.nutrition?.carbs ?? fallback?.nutrition.carbs ?? '',
            ingredients: product.nutrition?.ingredients ?? fallback?.nutrition.ingredients ?? [],
        },
        highlights: product.highlights ?? fallback?.highlights ?? [],
        badges: product.badges ?? fallback?.badges ?? [],
        reviews: product.reviews ?? fallback?.reviews ?? [],
    } as Product;
}

async function fetchBackend<T>(path: string): Promise<T | undefined> {
    try {
        const response = await fetch(`${API_URL}${path}`);
        if (!response.ok) {
            console.error(`Product request failed (${response.status}): ${path}`);
            return undefined;
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error(`Product request failed: ${path}`, error);
        return undefined;
    }
}

export async function fetchProducts(): Promise<Product[]> {
    const backendResponse = await fetchBackend<{ data: BackendProduct[]; meta: { total: number } }>('/api/products');
    if (!backendResponse) {
        return products;
    }

    return backendResponse.data.map(mergeWithLocalData);
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
    const backendResponse = await fetchBackend<{ data: BackendProduct }>('/api/products/' + slug);
    if (backendResponse?.data) {
        return mergeWithLocalData(backendResponse.data);
    }

    return products.find((product) => product.slug === slug);
}

export async function fetchCategories(): Promise<string[]> {
    const backendResponse = await fetchBackend<{ data: BackendProduct[]; meta: { total: number } }>('/api/products');
    const categories = backendResponse ? backendResponse.data.map((product) => product.category) : products.map((product) => product.category);
    return Array.from(new Set(categories));
}
