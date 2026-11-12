import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient, SectionType } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/api/.env') });

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqbqawtxo',
  api_key: process.env.CLOUDINARY_API_KEY || '517836978464723',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'im0G-B_giSEUiAxoPuf_KzKF8do',
});

const ROOMS = [
  {
    name: 'Lakeview Grand Salon',
    type: SectionType.PANORAMA,
    order: 0,
    sourceUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Master Como Horizon Suite',
    type: SectionType.PANORAMA,
    order: 1,
    sourceUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Waterfront Terrace & Dock',
    type: SectionType.PANORAMA,
    order: 2,
    sourceUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Italian Designer Kitchen',
    type: SectionType.PANORAMA,
    order: 3,
    sourceUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Lake Panorama Spa Bath',
    type: SectionType.PANORAMA,
    order: 4,
    sourceUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2400&q=85',
  },
];

async function main() {
  const property = await prisma.property.findUnique({
    where: { slug: 'villa-lumina-lake-como' },
    include: { sections: true },
  });

  if (!property) {
    console.log('Villa Lumina not found, skipping');
    return;
  }

  console.log(`Uploading real photography for ${property.title} to Cloudinary...`);
  // Delete old placeholder sections
  await prisma.propertySection.deleteMany({
    where: { propertyId: property.id },
  });

  for (let i = 0; i < ROOMS.length; i++) {
    const room = ROOMS[i];
    console.log(`[${i + 1}/${ROOMS.length}] Uploading ${room.name}...`);
    const uploadResult = await cloudinary.uploader.upload(room.sourceUrl, {
      folder: '3d-shortlet/villa-lumina',
      public_id: `room-${i}-${room.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      overwrite: true,
      transformation: [{ width: 2400, crop: 'limit', quality: 'auto:best', fetch_format: 'auto' }],
    });

    await prisma.propertySection.create({
      data: {
        propertyId: property.id,
        name: room.name,
        type: room.type,
        order: room.order,
        imageUrl: uploadResult.secure_url,
        initialYaw: 0,
        initialPitch: 0,
        hotspots: [],
      },
    });
    console.log(`  ✓ Saved: ${uploadResult.secure_url}`);
  }

  console.log('All Villa Lumina rooms updated with real Cloudinary photography!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
