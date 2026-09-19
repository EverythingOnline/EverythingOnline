import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryNames = [
    'Food & Groceries',
    'Fresh Produce',
    'Beverages',
    'Bakery',
    'Home & Kitchen',
    'Electronics',
    'Phones & Accessories',
    'Fashion',
    'Health & Beauty',
    'Household & Cleaning Supplies',
    'Baby Products',
    'Sports & Outdoors',
    'Books, Stationery & Office',
    'Automotive',
    'Furniture & Décor',
    'Toys & Games',
    'Pet Supplies',
    'Other',
];

function slugify(name: string) {
    return name
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function main() {
    for (const name of categoryNames) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name, slug: slugify(name) },
        });
    }

    console.log(`Seeded ${categoryNames.length} product categories.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
