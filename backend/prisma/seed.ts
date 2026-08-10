import { PrismaClient } from '@prisma/client';
import { products as frontendProducts } from '../../src/data/products.ts';

const prisma = new PrismaClient();

async function main() {
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    const categories = Array.from(new Set(frontendProducts.map((product) => product.category)));
    const categoryMap: Record<string, string> = {};

    for (const categoryName of categories) {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        const category = await prisma.category.create({ data: { name: categoryName, slug } });
        categoryMap[categoryName] = category.id;
    }

    for (const product of frontendProducts) {
        await prisma.product.create({
            data: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                brand: product.brand,
                price: product.price,
                originalPrice: product.originalPrice ?? product.price,
                discount: product.discount,
                rating: product.rating,
                reviewCount: product.reviewCount,
                stock: product.stock,
                lowStockThreshold: product.lowStockThreshold ?? 5,
                isArchived: product.isArchived ?? false,
                nutrition: JSON.stringify(product.nutrition),
                categoryId: categoryMap[product.category] ?? categoryMap['Milk'],
                images: Array.isArray(product.images) ? product.images[0] ?? '' : String(product.images ?? ''),
            },
        });
    }

    console.log('Seeded database with frontend products.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
