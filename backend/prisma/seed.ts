import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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

const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

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
    if (!adminEmail || !adminPassword) {
        throw new Error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD environment variables.');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: 'Administrator',
            password: hashedPassword,
            role: 'admin',
        },
        create: {
            email: adminEmail,
            name: 'Administrator',
            password: hashedPassword,
            role: 'admin',
        },
    });

    for (const name of categoryNames) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name, slug: slugify(name) },
        });
    }

    console.log(`Seeded admin user (${adminEmail}) and ${categoryNames.length} product categories.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
