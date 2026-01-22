import { PrismaClient } from '@prisma/client';
import { addDays, startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

function randomDateThisMonth(): Date {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());
  const diff = end.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * diff);
}

export async function seedOrders() {

  const users = await prisma.user.findMany({
    where: { isActive: true },
  });
  if (!users.length) {
    return;
  }

  // Get some active products with SKUs
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      variants: {
        include: {
          skus: true,
        },
      },
    },
  });
  if (!products.length) {
    console.log('No active products found, skipping order seeding.');
    return;
  }

  for (let i = 0; i < 40; i++) {
    const user = users[i % users.length];
    const product = products[i % products.length];
    const variant = product.variants[0];
    const sku = variant.skus[0];

    const createdAt = randomDateThisMonth();
    const shippedAt = addDays(createdAt, 1);
    const deliveredAt = addDays(createdAt, 2);

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${i}`,
        createdById: user.id,
        status: 'DELIVERED',
        paymentStatus: 'COMPLETED',
        subtotal: sku.price,
        taxAmount: 0,
        shippingAmount: 5,
        discountAmount: 0,
        totalAmount: sku.price.plus(5),
        currency: 'USD',
        customerName: user.name || 'Test Customer',
        customerEmail: user.email,
        customerPhone: '+1234567890',
        customerAddress: {
          address: '123 Test St',
          city: 'Testville',
          country: 'Testland',
        },
        notes: 'Seeded order',
        trackingNumber: `TRACK-${Date.now()}-${i}`,
        createdAt,
        shippedAt,
        deliveredAt,
        deliveryLat: 35.751206,
        deliveryLng: -5.800534,
        deliveryPlace: 'no 3, Rue 20, Tangier 90060',
        items: {
          create: [
            {
              skuId: sku.id,
              quantity: Math.ceil(Math.random() * 5), // random quantity 1-5
              unitPrice: sku.price,
              totalPrice: sku.price,
              productName: product.name,
              skuCode: sku.sku,
            },
          ],
        },
      },
    });

    console.log("test")

    console.log(
      `✅ Created order ${order.orderNumber} on ${createdAt.toDateString()}`,
    );
  }

  console.log('✅ 40 Orders seeding complete');
}
