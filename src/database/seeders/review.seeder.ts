import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

const reviewTitles = [
  'Excellent product!',
  'Very satisfied',
  'Good quality',
  'Worth the money',
  'Highly recommend',
  'Great purchase',
  'Amazing quality',
  'Perfect for my needs',
  'Exceeded expectations',
  'Good value',
  'Not bad',
  'Could be better',
  'Decent product',
  'Average quality',
  'Disappointed',
];

const reviewComments = [
  'This product exceeded my expectations. The quality is outstanding and it arrived quickly.',
  'Great value for money. I would definitely buy again.',
  'The product is good but shipping took longer than expected.',
  'Exactly as described. Very happy with my purchase.',
  'Good quality but a bit overpriced in my opinion.',
  'Love it! Works perfectly and looks great.',
  'Not quite what I expected but still useful.',
  'Excellent customer service and fast delivery.',
  'The product is okay, nothing special.',
  'Amazing! Better than similar products I\'ve tried.',
  'Good product overall, minor issues with packaging.',
  'Very satisfied with the quality and performance.',
  'Decent product for the price point.',
  'Would recommend to friends and family.',
  'The best purchase I\'ve made this year!',
];

function getRandomRating(): number {
  // Weighted towards higher ratings (more realistic)
  const rand = Math.random();
  if (rand < 0.5) return 5;
  if (rand < 0.75) return 4;
  if (rand < 0.9) return 3;
  if (rand < 0.97) return 2;
  return 1;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function seedReviews() {
  console.log('🌱 Seeding reviews...');

  const users = await prisma.user.findMany({
    where: { isActive: true },
  });

  if (!users.length) {
    console.log('No active users found, skipping review seeding.');
    return;
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
  });

  if (!products.length) {
    console.log('No active products found, skipping review seeding.');
    return;
  }

  let reviewCount = 0;

  // Create 3-8 reviews per product
  for (const product of products) {
    const numReviews = Math.floor(Math.random() * 6) + 3; // 3-8 reviews
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(numReviews, users.length); i++) {
      const user = shuffledUsers[i];
      const rating = getRandomRating();
      const createdAt = subDays(new Date(), Math.floor(Math.random() * 90)); // Random date in last 90 days

      try {
        await prisma.productReview.create({
          data: {
            productId: product.id,
            userId: user.id,
            rating,
            title: getRandomElement(reviewTitles),
            comment: Math.random() > 0.2 ? getRandomElement(reviewComments) : null, // 80% have comments
            isApproved: Math.random() > 0.1, // 90% approved
            createdAt,
            updatedAt: createdAt,
          },
        });

        reviewCount++;
      } catch (error) {
        // Skip if review already exists (unique constraint)
        continue;
      }
    }
  }

  // Update product ratings
  for (const product of products) {
    const reviews = await prisma.productReview.findMany({
      where: {
        productId: product.id,
        isApproved: true
      },
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      // await prisma.product.update({
      //   where: { id: product.id },
      //   data: { avgRating },
      // });
    }
  }

  console.log(`✅ Created ${reviewCount} reviews`);
}

export async function clearReviews() {
  await prisma.productReview.deleteMany();
  console.log('✅ Reviews cleared');
}
