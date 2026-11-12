import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient, SectionType } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load apps/api/.env
dotenv.config({ path: path.resolve('apps/api/.env') });

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqbqawtxo',
  api_key: process.env.CLOUDINARY_API_KEY || '517836978464723',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'im0G-B_giSEUiAxoPuf_KzKF8do',
});

const ROOM_IMAGES = [
  {
    key: 'arrival',
    name: 'Cliffside Horizon Terrace & Pool',
    type: SectionType.PANORAMA,
    order: 0,
    sourceUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85',
    hotspotLabels: [
      { targetKey: 'living', label: 'Enter Grand Salon', pos: [0.75, 0.05, -0.65] },
      { targetKey: 'bedroom', label: 'Master Suite Balcony', pos: [-0.85, 0.1, -0.5] },
    ],
  },
  {
    key: 'living',
    name: 'Grand Oceanfront Salon',
    type: SectionType.PANORAMA,
    order: 1,
    sourceUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=85',
    hotspotLabels: [
      { targetKey: 'bedroom', label: 'Master Horizon Suite', pos: [-0.85, 0.05, -0.5] },
      { targetKey: 'kitchen', label: 'Gourmet Quartz Kitchen', pos: [0.8, -0.05, -0.6] },
      { targetKey: 'arrival', label: 'Infinity Terrace & Pool', pos: [0.0, 0.0, 1.0] },
    ],
  },
  {
    key: 'bedroom',
    name: 'Master Horizon Suite',
    type: SectionType.PANORAMA,
    order: 2,
    sourceUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2400&q=85',
    hotspotLabels: [
      { targetKey: 'bathroom', label: 'Calacatta Marble Spa Bath', pos: [0.8, -0.05, -0.6] },
      { targetKey: 'living', label: 'Return to Grand Salon', pos: [-0.1, 0.0, -1.0] },
      { targetKey: 'arrival', label: 'Private Balcony Access', pos: [0.85, 0.0, 0.5] },
    ],
  },
  {
    key: 'kitchen',
    name: 'Gourmet Quartz Kitchen',
    type: SectionType.PHOTO,
    order: 3,
    sourceUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=85',
    hotspotLabels: [
      { targetKey: 'living', label: 'Return to Grand Salon', pos: [-0.7, 0, 0.7] },
    ],
  },
  {
    key: 'bathroom',
    name: 'Calacatta Marble Spa Bath',
    type: SectionType.PHOTO,
    order: 4,
    sourceUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2400&q=85',
    hotspotLabels: [
      { targetKey: 'bedroom', label: 'Master Bedroom', pos: [0, 0, -1] },
    ],
  },
];

async function seedVillaBellissima() {
  console.log('--- Seeding Villa Bellissima Coastline with Real Cloudinary Photos ---');

  // 1. Upload each real image to Cloudinary folder '3d-shortlet/villa-bellissima'
  const uploadedUrls = {};

  for (const room of ROOM_IMAGES) {
    console.log(`Uploading ${room.name} to Cloudinary...`);
    try {
      const res = await cloudinary.uploader.upload(room.sourceUrl, {
        folder: '3d-shortlet/villa-bellissima',
        public_id: `${room.key}-real`,
        overwrite: true,
        resource_type: 'image',
      });
      uploadedUrls[room.key] = res.secure_url;
      console.log(`✓ ${room.name} => ${res.secure_url}`);
    } catch (err) {
      console.warn(`Cloudinary direct remote upload failed for ${room.key}, downloading buffer first...`);
      const imgRes = await fetch(room.sourceUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const res = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: '3d-shortlet/villa-bellissima',
            public_id: `${room.key}-real`,
            overwrite: true,
            resource_type: 'image',
          },
          (err, result) => {
            if (err || !result) return reject(err || new Error('Upload failed'));
            resolve(result);
          }
        );
        stream.end(buffer);
      });
      uploadedUrls[room.key] = res.secure_url;
      console.log(`✓ ${room.name} => ${res.secure_url}`);
    }
  }

  // 2. Upsert Property in Neon PostgreSQL
  console.log('Upserting Villa Bellissima Coastline in database...');
  const property = await prisma.property.upsert({
    where: { slug: 'villa-bellissima-coastline' },
    update: {
      title: 'Villa Bellissima Coastline',
      tagLine: 'Cascading contemporary cliffside estate overlooking the Tyrrhenian Sea',
      description:
        'Perched on the sun-soaked cliffs of the Amalfi Coast, Villa Bellissima blends contemporary minimalist architecture with ancient Italian stone. Featuring cantilevered glass balconies, a rimless infinity pool meeting the sea, a monolithic quartz kitchen, and an ultra-private master sanctuary with endless maritime vistas.',
      location: 'Amalfi Coast, Italy',
      bedrooms: 5,
      bathrooms: 6,
      maxGuests: 10,
      pricePerNight: 3200,
      cleaningFee: 450,
      minNights: 3,
      maxNights: 21,
      rules: 'No pets. Strict indoor non-smoking policy. Private events require prior concierge arrangement.',
      isFeatured: true,
    },
    create: {
      slug: 'villa-bellissima-coastline',
      title: 'Villa Bellissima Coastline',
      tagLine: 'Cascading contemporary cliffside estate overlooking the Tyrrhenian Sea',
      description:
        'Perched on the sun-soaked cliffs of the Amalfi Coast, Villa Bellissima blends contemporary minimalist architecture with ancient Italian stone. Featuring cantilevered glass balconies, a rimless infinity pool meeting the sea, a monolithic quartz kitchen, and an ultra-private master sanctuary with endless maritime vistas.',
      location: 'Amalfi Coast, Italy',
      bedrooms: 5,
      bathrooms: 6,
      maxGuests: 10,
      pricePerNight: 3200,
      cleaningFee: 450,
      minNights: 3,
      maxNights: 21,
      rules: 'No pets. Strict indoor non-smoking policy. Private events require prior concierge arrangement.',
      isFeatured: true,
    },
  });

  console.log(`✓ Property ID: ${property.id}`);

  // 3. Clear existing amenities & sections for this property to avoid duplicates
  await prisma.amenity.deleteMany({ where: { propertyId: property.id } });
  await prisma.propertySection.deleteMany({ where: { propertyId: property.id } });

  // 4. Create Amenities
  const amenitiesData = [
    { name: 'Cantilevered Horizon Pool', icon: 'waves' },
    { name: 'Panoramic Tyrrhenian Terrace', icon: 'sunset' },
    { name: 'Monolithic Quartz Chef\'s Bar', icon: 'sparkles' },
    { name: 'Calacatta Marble Spa Bath', icon: 'flower' },
    { name: 'Private Speedboat Mooring', icon: 'anchor' },
    { name: '24/7 Dedicated Estate Concierge', icon: 'bell' },
  ];

  for (const am of amenitiesData) {
    await prisma.amenity.create({
      data: {
        propertyId: property.id,
        name: am.name,
        icon: am.icon,
      },
    });
  }
  console.log(`✓ Created ${amenitiesData.length} luxury amenities`);

  // 5. Create Sections (first pass to get IDs)
  const sectionKeyToId = {};
  for (const room of ROOM_IMAGES) {
    const created = await prisma.propertySection.create({
      data: {
        propertyId: property.id,
        name: room.name,
        order: room.order,
        type: room.type,
        imageUrl: uploadedUrls[room.key],
        initialYaw: 0,
        initialPitch: 0,
        hotspots: [],
      },
    });
    sectionKeyToId[room.key] = created.id;
  }
  console.log(`✓ Created ${ROOM_IMAGES.length} rooms/sections with Cloudinary CDN URLs`);

  // 6. Connect reciprocal hotspots
  for (const room of ROOM_IMAGES) {
    const sectionId = sectionKeyToId[room.key];
    const hotspots = room.hotspotLabels.map((h, idx) => ({
      id: `hs-bellissima-${room.key}-${idx}`,
      targetSectionId: sectionKeyToId[h.targetKey] || sectionId,
      label: h.label,
      position: h.pos,
    }));

    await prisma.propertySection.update({
      where: { id: sectionId },
      data: { hotspots },
    });
  }
  console.log('✓ Interconnected reciprocal 3D spatial hotspots between all rooms');

  console.log('--- ALL DONE: Villa Bellissima Coastline is live on Cloudinary and DB! ---');
}

seedVillaBellissima()
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
