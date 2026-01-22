// backend/src/database/seeders/seedProducts.ts
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { secrets } from '../../config/secrets';

const prisma = new PrismaClient();

// === IMAGE FILES ===
const wdBlueImages = {
  '500gb': ['wd-blue-mobile-500gb.png.thumb.1280.1280.png'],
  '1tb': ['wd-blue-mobile-1tb.png.thumb.1280.1280.png'],
  '2tb': ['wd-blue-mobile-2tb.png.thumb.1280.1280.png'],
};

// === HELPERS ===
function generateEAN13Barcode(prefix: string = '690'): string {
  // Generate EAN-13 barcode (13 digits)
  // Format: Country code (3) + Manufacturer code (4-5) + Product code (3-4) + Check digit (1)

  // Generate random 9 digits after the prefix
  const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const barcodeWithoutChecksum = prefix + randomDigits;

  // Calculate EAN-13 check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcodeWithoutChecksum[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return barcodeWithoutChecksum + checkDigit;
}

function getLocalImageUrls(imageFiles: string[], folder: string): string[] {
  return imageFiles.map((filename) => {
    // Return full URL with base URL
    return `${secrets.BaseUrl}/images/products/${folder}/${filename}`;
  });
}

async function copyImagesToPublic(imageFiles: string[], sourceFolder: string, destFolder: string) {
  const publicDir = path.resolve(__dirname, '../../../public/images/products', destFolder);

  // Create directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  imageFiles.forEach((filename) => {
    const sourcePath = path.resolve(__dirname, sourceFolder, filename);
    const destPath = path.join(publicDir, filename);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${filename} to public folder`);
    } else {
      console.warn(`⚠️ Source image not found: ${sourcePath}`);
    }
  });
}

// === MAIN SEED FUNCTION ===
export async function seedProducts() {
  console.log('🌱 Clearing existing products...');

  console.log('✅ All products cleared');

  // === WD BLUE PC MOBILE HARD DRIVE ===
  console.log('✨ Seeding WD Blue PC Mobile Hard Drive...');

  const storageCategorySlug = 'storage';
  let storageCategory = await prisma.category.findUnique({
    where: { slug: storageCategorySlug },
  });

  if (!storageCategory) {
    storageCategory = await prisma.category.create({
      data: {
        name: 'Storage',
        slug: storageCategorySlug,
        isActive: true,
      },
    });
    console.log('✅ Created category: Storage');
  }

  const wdBlueSlug = 'wd-blue-pc-mobile-hard-drive';
  const wdBlueExists = await prisma.product.findUnique({
    where: { slug: wdBlueSlug },
  });

  if (!wdBlueExists) {
    // Copy images to public folder and get URLs
    console.log('📁 Copying images to public folder...');
    await copyImagesToPublic(wdBlueImages['500gb'], './hard', 'hard');
    await copyImagesToPublic(wdBlueImages['1tb'], './hard', 'hard');
    await copyImagesToPublic(wdBlueImages['2tb'], './hard', 'hard');

    const images500gb = getLocalImageUrls(wdBlueImages['500gb'], 'hard');
    const images1tb = getLocalImageUrls(wdBlueImages['1tb'], 'hard');
    const images2tb = getLocalImageUrls(wdBlueImages['2tb'], 'hard');

    await prisma.product.create({
      data: {
        name: 'WD Blue PC Mobile Hard Drive',
        slug: wdBlueSlug,
        description:
          'WD Blue PC Mobile Hard Drive offers reliable storage for your laptop or desktop. With 5400 RPM spin speed and SATA 6 Gb/s interface, it delivers excellent performance for everyday computing needs. Available in 500GB, 1TB, and 2TB capacities.',
        shortDesc: 'Reliable mobile hard drive for laptops and desktops',
        coverImage: images500gb[0],
        isFeatured: true,
        metaTitle: 'WD Blue PC Mobile Hard Drive - Reliable Storage',
        metaDesc:
          'Shop WD Blue PC Mobile Hard Drive. Available in 500GB, 1TB, and 2TB capacities. Perfect for laptops and desktops.',
        isActive: true,
        sortOrder: 0,
        categories: {
          connect: { id: storageCategory.id },
        },
        variants: {
          create: [
            {
              name: '500GB',
              attributes: { capacity: '500GB' },
              isActive: true,
              sortOrder: 0,
              skus: {
                create: [
                  {
                    sku: 'WD-BLUE-500GB',
                    barcode: generateEAN13Barcode('690'),
                    price: 450,
                    stock: 25,
                    weight: 120,
                    dimensions: {
                      length: 10,
                      width: 7,
                      height: 1,
                      size: '500GB',
                    },
                    coverImage: images500gb[0],
                    lowStockAlert: 5,
                    isActive: true,
                    images: {
                      create: images500gb.map((url, idx) => ({
                        url,
                        altText: `WD Blue 500GB Mobile Hard Drive view ${idx + 1}`,
                        position: idx,
                      })),
                    },
                  },
                ],
              },
            },
            {
              name: '1TB',
              attributes: { capacity: '1TB' },
              isActive: true,
              sortOrder: 1,
              skus: {
                create: [
                  {
                    sku: 'WD-BLUE-1TB',
                    barcode: generateEAN13Barcode('690'),
                    price: 650,
                    stock: 30,
                    weight: 120,
                    dimensions: {
                      length: 10,
                      width: 7,
                      height: 1,
                      size: '1TB',
                    },
                    coverImage: images1tb[0],
                    lowStockAlert: 5,
                    isActive: true,
                    images: {
                      create: images1tb.map((url, idx) => ({
                        url,
                        altText: `WD Blue 1TB Mobile Hard Drive view ${idx + 1}`,
                        position: idx,
                      })),
                    },
                  },
                ],
              },
            },
            {
              name: '2TB',
              attributes: { capacity: '2TB' },
              isActive: true,
              sortOrder: 2,
              skus: {
                create: [
                  {
                    sku: 'WD-BLUE-2TB',
                    barcode: generateEAN13Barcode('690'),
                    price: 950,
                    stock: 20,
                    weight: 120,
                    dimensions: {
                      length: 10,
                      width: 7,
                      height: 1,
                      size: '2TB',
                    },
                    coverImage: images2tb[0],
                    lowStockAlert: 5,
                    isActive: true,
                    images: {
                      create: images2tb.map((url, idx) => ({
                        url,
                        altText: `WD Blue 2TB Mobile Hard Drive view ${idx + 1}`,
                        position: idx,
                      })),
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    console.log('✅ Created product: WD Blue PC Mobile Hard Drive');
  }

  console.log('🎉 Product seeding complete');
}
