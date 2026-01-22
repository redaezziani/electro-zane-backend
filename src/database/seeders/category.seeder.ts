import { PrismaClient, UserRole } from '@prisma/client';


const prisma = new PrismaClient();

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and accessories',
    info: { icon: 'electronics', color: '#1976d2' },
    children: [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile phones and smartphones',
        info: { icon: 'phone', color: '#388e3c' },
      }
     
    ],
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and clothing items',
    info: { icon: 'clothing', color: '#e91e63' },
    children: [
      {
        name: 'Men\'s Clothing',
        slug: 'mens-clothing',
        description: 'Clothing for men',
        info: { icon: 'male', color: '#2196f3' },
      },
     
    ],
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home improvement and garden supplies',
    info: { icon: 'home', color: '#4caf50' },
    children: [
      {
        name: 'Furniture',
        slug: 'furniture',
        description: 'Home and office furniture',
        info: { icon: 'chair', color: '#795548' },
      },
     
    ],
  },
  {
    name: 'Beauty & Fragrance',
    slug: 'beauty-fragrance',
    description: 'Beauty products, perfumes, and cosmetics',
    info: { icon: 'beauty', color: '#e91e63' },
    children: [
      {
        name: 'Perfumes',
        slug: 'perfumes',
        description: 'Luxury fragrances and perfumes',
        info: { icon: 'fragrance', color: '#9c27b0' },
      },
      {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Skincare and beauty products',
        info: { icon: 'skincare', color: '#ff5722' },
      },
    ],
  },
];

export async function seedCategories() {
  console.log('🌱 Seeding categories...');

  for (const categoryData of categories) {
    // Create parent category
    const parentCategory = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        info: categoryData.info,
        isActive: true,
        sortOrder: 0,
      },
    });

    console.log(`✅ Created parent category: ${parentCategory.name}`);

    // Create child categories
    if (categoryData.children) {
      for (const [index, childData] of categoryData.children.entries()) {
        const childCategory = await prisma.category.upsert({
          where: { slug: childData.slug },
          update: {},
          create: {
            name: childData.name,
            slug: childData.slug,
            description: childData.description,
            info: childData.info,
            parentId: parentCategory.id,
            isActive: true,
            sortOrder: index,
          },
        });

        console.log(`  ✅ Created child category: ${childCategory.name}`);
      }
    }
  }

  console.log('✅ Categories seeded successfully');
}
