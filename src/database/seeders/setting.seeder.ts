import { PrismaClient, SettingType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSettings() {
  console.log('🌱 Seeding settings...');

  const settingsToSeed = [
    {
      key: 'site_name',
      label: 'Site Name',
      valueString: 'My Awesome Store',
      description: 'The name of the website',
      type: SettingType.STRING,
    },
    {
      key: 'tax_rate',
      label: 'Tax Rate',
      valueNumber: 0.15,
      description: 'Default tax rate for orders',
      type: SettingType.NUMBER,
    },
    {
      key: 'enable_payments',
      label: 'Enable Payments',
      valueBool: true,
      description: 'Enable or disable payment gateway',
      type: SettingType.BOOLEAN,
    },
    {
      key: 'supported_currencies',
      label: 'Supported Currencies',
      valueString: JSON.stringify(['USD', 'EUR', 'GBP']),
      description: 'List of currencies supported by the store',
      type: SettingType.SELECT,
      options: JSON.stringify([
        { key: 'USD', label: 'USD' },
        { key: 'EUR', label: 'EUR' },
        { key: 'GBP', label: 'GBP' },
      ]),
    },
    {
      key: 'default_shipping_method',
      label: 'Default Shipping Method',
      valueString: 'standard',
      description: 'Default shipping method for orders',
      type: SettingType.SELECT,
      options: JSON.stringify([
        { key: 'standard', label: 'Standard' },
        { key: 'express', label: 'Express' },
      ]),
    },
  ];

  for (const settingData of settingsToSeed) {
    try {
      const existing = await prisma.setting.findUnique({
        where: { key: settingData.key },
      });
      if (existing) {
        console.log(
          `⚡ Setting "${settingData.key}" already exists, skipping...`,
        );
        continue;
      }

      const setting = await prisma.setting.create({ data: settingData });
      console.log(`✅ Created setting: ${setting.key}`);
    } catch (error) {
      console.error(`❌ Failed to create setting ${settingData.key}:`, error);
    }
  }

  console.log('✨ Settings seeding completed!');
}

export async function clearSettings() {
  console.log('🧹 Clearing settings...');
  try {
    await prisma.setting.deleteMany();
    console.log('🗑️ All settings cleared');
  } catch (error) {
    console.error('❌ Failed to clear settings:', error);
  }
}

// Run directly
if (require.main === module) {
  seedSettings()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
}
