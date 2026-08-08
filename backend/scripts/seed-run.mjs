import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    const milkCat = await prisma.category.create({ data: { id: 'cat-milk', name: 'Milk', slug: 'milk' } });

    const products = [
        {
            id: 'milk-001',
            name: 'Fresh Whole Milk',
            slug: 'fresh-whole-milk',
            description: 'Creamy whole milk sourced from pasture-raised cows, bottled fresh in 1 litre packs.',
            brand: 'EverPure Dairy',
            price: 490,
            originalPrice: 620,
            discount: 21,
            rating: 4.8,
            reviewCount: 128,
            stock: 52,
            images: 'https://images.unsplash.com/photo-1587314168482-67ac9f7a8db5?auto=format&fit=crop&w=1000&q=80',
            nutrition: JSON.stringify({ calories: '150 kcal', protein: '8g', fat: '8g', carbs: '12g', ingredients: ['Whole milk'] }),
        },
        {
            id: 'milk-002',
            name: 'Low Fat Milk',
            slug: 'low-fat-milk',
            description: 'Light and smooth low fat milk in 500 ml bottles, rich in calcium and ideal for tea.',
            brand: 'Green Valley',
            price: 520,
            originalPrice: 600,
            discount: 13,
            rating: 4.6,
            reviewCount: 86,
            stock: 74,
            images: 'https://images.unsplash.com/photo-1576765607920-a1bb04826f6b?auto=format&fit=crop&w=1000&q=80',
            nutrition: JSON.stringify({ calories: '110 kcal', protein: '8g', fat: '3g', carbs: '12g', ingredients: ['Low fat milk'] }),
        },
    ];

    for (const p of products) {
        await prisma.product.create({ data: { ...p, categoryId: milkCat.id } });
    }

    console.log('Seeded database with stable product IDs.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
