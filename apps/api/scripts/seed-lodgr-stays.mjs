// Seed Nigerian Luxury Shortlets for Lodgr 3D
// Run from: apps/api/
// Command:  node --env-file=.env scripts/seed-lodgr-stays.mjs

import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// High-quality Unsplash architectural images
const NIGERIAN_STAYS = [
  {
    slug: 'grand-ikoyi-waterfront-villa',
    title: 'The Grand Ikoyi Waterfront Villa',
    tagLine: 'Private waterfront compound with infinity pool, chef service & 24/7 power',
    description: 'Set on a serene stretch of Ikoyi waterfront, this 5-bedroom compound epitomizes Lagos luxury living. Floor-to-ceiling glass walls frame panoramic lagoon views, while an infinity pool extends seamlessly toward the water horizon. The residence features smart home automation, a bespoke wine cellar, a private chef\'s kitchen, and a fully-equipped home cinema — all backed by industrial 24/7 power infrastructure.',
    location: 'Ikoyi, Lagos, Nigeria',
    city: 'Lagos',
    neighborhood: 'Ikoyi',
    category: 'WATERFRONT_VILLA',
    bedrooms: 5,
    bathrooms: 6,
    maxGuests: 10,
    pricePerNight: 850,
    cleaningFee: 120,
    cautionDeposit: 1000,
    serviceFeePercent: 5,
    minNights: 2,
    maxNights: 30,
    isFeatured: true,
    has247Power: true,
    hasSecurity: true,
    hasPool: true,
    hasChef: true,
    hasWifi: true,
    rating: 4.98,
    reviewCount: 24,
    hostName: 'Emeka O.',
    hostIsSuperhost: true,
    hostResponseTime: 'within 30 minutes',
    neighborhoodHighlights: ['Ikoyi Club 2 mins away', 'Victoria Island CBD 5 mins', 'Eko Hotel & Suites 10 mins'],
    rules: 'No smoking indoors. Events by prior arrangement only. Check-in 2PM, Check-out 11AM.',
    sections: [
      {
        name: 'Exterior & Waterfront',
        imageUrl: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=2000&q=90',
        type: 'PANORAMA', order: 0,
        hotspots: [{ id: 'h1', targetSectionId: 's2', label: 'Enter Living Area', position: [0.9, -0.1, -0.4] }],
      },
      {
        name: 'Grand Living Hall',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=90',
        type: 'PANORAMA', order: 1,
        hotspots: [
          { id: 'h2', targetSectionId: 's3', label: 'Master Suite', position: [-0.8, 0.0, -0.6] },
          { id: 'h3', targetSectionId: 's4', label: 'Pool Terrace', position: [0.0, -0.2, 1.0] },
        ],
      },
      {
        name: 'Master Bedroom',
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=2000&q=90',
        type: 'PANORAMA', order: 2,
        hotspots: [{ id: 'h4', targetSectionId: 's2', label: 'Back to Living Hall', position: [0, 0, -1] }],
      },
      {
        name: 'Infinity Pool & Lagoon',
        imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=2000&q=90',
        type: 'PANORAMA', order: 3,
        hotspots: [{ id: 'h5', targetSectionId: 's2', label: 'Return Inside', position: [0, 0.1, -0.9] }],
      },
      {
        name: 'Chef\'s Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2000&q=90',
        type: 'PANORAMA', order: 4,
        hotspots: [],
      },
    ],
    amenities: [
      { name: 'Infinity Lagoon-View Pool', icon: 'waves' },
      { name: 'Private Chef Service', icon: 'chef' },
      { name: '24/7 Industrial Generator', icon: 'zap' },
      { name: 'Smart Home Automation', icon: 'cpu' },
      { name: 'Private Jetty / Boat Dock', icon: 'anchor' },
      { name: 'Home Cinema Room', icon: 'film' },
      { name: 'Private Gym & Wellness', icon: 'dumbbell' },
      { name: '24/7 Armed Security', icon: 'shield' },
    ],
    reviews: [
      { guestName: 'Adaeze Okonkwo', guestAvatar: '👩🏾', rating: 5, comment: 'Absolutely breathtaking! The waterfront view from the infinity pool at night is indescribable. 24/7 power worked flawlessly, and the chef was exceptional. Best Lagos stay ever.', stayDate: 'Oct 2026' },
      { guestName: 'Chukwuemeka Bello', guestAvatar: '👨🏿', rating: 5, comment: 'Came for a family reunion — the space was perfect for 10 of us. The host responded in minutes every time. Caution deposit returned same day after checkout.', stayDate: 'Sep 2026' },
      { guestName: 'Fatima Aliyu', guestAvatar: '👩🏽', rating: 5, comment: 'The virtual tour sold me instantly — and the real thing exceeded expectations. No NEPA issues, strong wifi, and the security gave us total peace of mind.', stayDate: 'Aug 2026' },
    ],
  },

  {
    slug: 'eko-pearl-sky-suite',
    title: 'Eko Pearl Sky Suite',
    tagLine: 'Iconic VI skyline penthouse with ocean panoramas, smart home & concierge',
    description: 'Perched on the upper floors of a Victoria Island high-rise, the Eko Pearl Sky Suite delivers a jaw-dropping marriage of ocean, island, and city skyline panoramas. The 3-bedroom suite features floor-to-ceiling glass, bespoke Italian furnishings, a wrap-around balcony, smart home integration (voice-controlled lighting, climate, and entertainment), and complimentary concierge services including airport transfers.',
    location: 'Victoria Island, Lagos, Nigeria',
    city: 'Lagos',
    neighborhood: 'Victoria Island',
    category: 'PENTHOUSE',
    bedrooms: 3,
    bathrooms: 4,
    maxGuests: 6,
    pricePerNight: 580,
    cleaningFee: 80,
    cautionDeposit: 600,
    serviceFeePercent: 5,
    minNights: 2,
    maxNights: 21,
    isFeatured: true,
    has247Power: true,
    hasSecurity: true,
    hasPool: false,
    hasChef: false,
    hasWifi: true,
    rating: 4.97,
    reviewCount: 31,
    hostName: 'Toyin A.',
    hostIsSuperhost: true,
    hostResponseTime: 'within 1 hour',
    neighborhoodHighlights: ['Eko Hotel 2 mins', 'Bar Beach 5 mins', 'Ozumba Mbadiwe Ave 1 min'],
    rules: 'No parties or events. Quiet hours 11PM. Strictly no smoking.',
    sections: [
      {
        name: 'Sky Terrace & Skyline',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2000&q=90',
        type: 'PANORAMA', order: 0,
        hotspots: [{ id: 'h1', targetSectionId: 's2', label: 'Enter Suite', position: [0.9, 0.0, -0.4] }],
      },
      {
        name: 'Living & Ocean View',
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2000&q=90',
        type: 'PANORAMA', order: 1,
        hotspots: [
          { id: 'h2', targetSectionId: 's3', label: 'Master Bedroom', position: [-0.8, 0.0, -0.6] },
          { id: 'h3', targetSectionId: 's4', label: 'Balcony', position: [1.0, -0.1, 0.0] },
        ],
      },
      {
        name: 'Master Suite',
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=2000&q=90',
        type: 'PANORAMA', order: 2,
        hotspots: [],
      },
      {
        name: 'Wrap-Around Balcony',
        imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=2000&q=90',
        type: 'PANORAMA', order: 3,
        hotspots: [],
      },
    ],
    amenities: [
      { name: 'Ocean & City Skyline Views', icon: 'eye' },
      { name: 'Smart Home (Voice Control)', icon: 'cpu' },
      { name: '24/7 Backup Power', icon: 'zap' },
      { name: 'Wrap-Around Sky Terrace', icon: 'wind' },
      { name: 'Concierge & Airport Transfer', icon: 'car' },
      { name: '24/7 Building Security', icon: 'shield' },
    ],
    reviews: [
      { guestName: 'Olamide Rasheed', guestAvatar: '👨🏾', rating: 5, comment: 'The skyline view is absolutely insane — especially at night. Smart home controls worked perfectly. Host was incredibly responsive.', stayDate: 'Oct 2026' },
      { guestName: 'Ngozi Eze', guestAvatar: '👩🏿', rating: 5, comment: 'Came for a business trip and ended up extending 3 extra nights. Quiet, secure, and the ocean breeze from the balcony is unreal.', stayDate: 'Sep 2026' },
      { guestName: 'Ibrahim Musa', guestAvatar: '👨🏽', rating: 4, comment: 'Very premium experience. Only minor issue was parking — but the concierge sorted it immediately. Would definitely rebook.', stayDate: 'Aug 2026' },
    ],
  },

  {
    slug: 'lekki-phase1-luxury-haven',
    title: 'The Lekki Phase 1 Luxury Haven',
    tagLine: '4-bedroom gated estate with private pool, garden retreat & 24/7 power',
    description: 'A secluded 4-bedroom estate in the heart of Lekki Phase 1, offering the perfect balance of serene privacy and urban connectivity. The residence features a landscaped private garden, temperature-controlled swimming pool, an open-plan entertaining kitchen, and bespoke African art throughout. All powered by a commercial-grade generator and solar inverter system — your stay is never interrupted.',
    location: 'Lekki Phase 1, Lagos, Nigeria',
    city: 'Lagos',
    neighborhood: 'Lekki Phase 1',
    category: 'LUXURY_APARTMENT',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    pricePerNight: 420,
    cleaningFee: 70,
    cautionDeposit: 500,
    serviceFeePercent: 5,
    minNights: 2,
    maxNights: 30,
    isFeatured: false,
    has247Power: true,
    hasSecurity: true,
    hasPool: true,
    hasChef: false,
    hasWifi: true,
    rating: 4.95,
    reviewCount: 19,
    hostName: 'Chidinma N.',
    hostIsSuperhost: false,
    hostResponseTime: 'within 2 hours',
    neighborhoodHighlights: ['Lekki-Epe Expressway 1 min', 'Palms Shopping Mall 10 mins', 'Oniru Beach 15 mins'],
    rules: 'No shoes inside. No events. Check-in after 2PM. Quiet hours 10PM.',
    sections: [
      {
        name: 'Garden & Pool',
        imageUrl: 'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=2000&q=90',
        type: 'PANORAMA', order: 0,
        hotspots: [{ id: 'h1', targetSectionId: 's2', label: 'Enter Living Room', position: [0.9, 0.0, -0.4] }],
      },
      {
        name: 'Open Living Area',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=2000&q=90',
        type: 'PANORAMA', order: 1,
        hotspots: [
          { id: 'h2', targetSectionId: 's3', label: 'Master Bedroom', position: [-0.8, 0.0, -0.6] },
          { id: 'h3', targetSectionId: 's4', label: 'Kitchen', position: [0.8, 0.0, 0.6] },
        ],
      },
      {
        name: 'Master Bedroom',
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=2000&q=90',
        type: 'PANORAMA', order: 2,
        hotspots: [],
      },
      {
        name: 'Modern Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2000&q=90',
        type: 'PANORAMA', order: 3,
        hotspots: [],
      },
    ],
    amenities: [
      { name: 'Private Swimming Pool', icon: 'waves' },
      { name: 'Landscaped Garden Retreat', icon: 'tree' },
      { name: '24/7 Power (Gen + Inverter)', icon: 'zap' },
      { name: '24/7 Armed Security Guard', icon: 'shield' },
      { name: 'African Art Collection', icon: 'image' },
      { name: 'High-Speed WiFi', icon: 'wifi' },
    ],
    reviews: [
      { guestName: 'Yemi Adeyemi', guestAvatar: '👨🏾', rating: 5, comment: 'Perfect family getaway. Kids loved the pool, and the garden is incredibly peaceful. Power never went out once during our 5-night stay.', stayDate: 'Oct 2026' },
      { guestName: 'Amara Obi', guestAvatar: '👩🏿', rating: 5, comment: 'Great value for Lekki Phase 1. Very secure, clean, and well-maintained. Host was helpful and accommodating.', stayDate: 'Sep 2026' },
      { guestName: 'Damilola F.', guestAvatar: '👩🏾', rating: 4, comment: 'Loved the space. The virtual tour was accurate — the pool and garden are even better in person.', stayDate: 'Aug 2026' },
    ],
  },

  {
    slug: 'maitama-diplomatic-residence',
    title: 'Maitama Diplomatic Pavilion',
    tagLine: '4-bedroom Abuja diplomat estate with private garden, gym & dedicated security',
    description: 'A distinguished 4-bedroom residence in Abuja\'s most prestigious neighborhood, Maitama. Preferred by diplomats, executives, and government officials, this pavilion features a manicured private garden, an in-house gymnasium, a formal dining room for 12, two executive studies, and round-the-clock dedicated security. The property sits behind a double gated perimeter with CCTV and armed guard presence.',
    location: 'Maitama, Abuja, Nigeria',
    city: 'Abuja',
    neighborhood: 'Maitama',
    category: 'LUXURY_APARTMENT',
    bedrooms: 4,
    bathrooms: 5,
    maxGuests: 8,
    pricePerNight: 480,
    cleaningFee: 90,
    cautionDeposit: 600,
    serviceFeePercent: 5,
    minNights: 3,
    maxNights: 30,
    isFeatured: true,
    has247Power: true,
    hasSecurity: true,
    hasPool: false,
    hasChef: false,
    hasWifi: true,
    rating: 4.99,
    reviewCount: 15,
    hostName: 'Musa B.',
    hostIsSuperhost: true,
    hostResponseTime: 'within 30 minutes',
    neighborhoodHighlights: ['Transcorp Hilton 5 mins', 'Wuse 2 Market 10 mins', 'Aso Rock View 15 mins'],
    rules: 'Strictly no events. VIP diplomatic discretion maintained. No outside catering. Check-in after 3PM.',
    sections: [
      {
        name: 'Main Entrance & Courtyard',
        imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=2000&q=90',
        type: 'PANORAMA', order: 0,
        hotspots: [{ id: 'h1', targetSectionId: 's2', label: 'Enter Residence', position: [0.9, 0.0, -0.4] }],
      },
      {
        name: 'Formal Living Room',
        imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000&q=90',
        type: 'PANORAMA', order: 1,
        hotspots: [
          { id: 'h2', targetSectionId: 's3', label: 'Master Suite', position: [-0.8, 0.0, -0.6] },
          { id: 'h3', targetSectionId: 's4', label: 'Private Garden', position: [0.0, -0.2, 1.0] },
        ],
      },
      {
        name: 'Executive Master Suite',
        imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=2000&q=90',
        type: 'PANORAMA', order: 2,
        hotspots: [],
      },
      {
        name: 'Private Garden & Terrace',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2000&q=90',
        type: 'PANORAMA', order: 3,
        hotspots: [],
      },
    ],
    amenities: [
      { name: 'Private Garden & Terrace', icon: 'tree' },
      { name: 'In-House Private Gym', icon: 'dumbbell' },
      { name: 'Formal Dining Room (12 Seats)', icon: 'utensils' },
      { name: 'Two Executive Studies', icon: 'briefcase' },
      { name: '24/7 Power & Generator', icon: 'zap' },
      { name: 'Double Gated Security + CCTV', icon: 'shield' },
      { name: 'High-Speed Fiber WiFi', icon: 'wifi' },
    ],
    reviews: [
      { guestName: 'Dr. Aliyu Musa', guestAvatar: '👨🏽', rating: 5, comment: 'Perfect for my executive retreat. The discretion and security level is exactly what I needed. Host is incredibly professional.', stayDate: 'Oct 2026' },
      { guestName: 'Nneka Williams', guestAvatar: '👩🏾', rating: 5, comment: 'Used this for a week-long delegation visit. The formal dining room was perfect for our meetings. Absolutely faultless stay.', stayDate: 'Sep 2026' },
      { guestName: 'James O.', guestAvatar: '👨🏿', rating: 5, comment: 'Maitama\'s finest. The garden is stunning in the morning. Power and security are top-class. No issues at all.', stayDate: 'Aug 2026' },
    ],
  },
];

async function main() {
  console.log('🇳🇬 Seeding Nigerian Luxury Shortlets...\n');

  for (const stay of NIGERIAN_STAYS) {
    // Check if already exists
    const existing = await prisma.property.findUnique({ where: { slug: stay.slug } });
    if (existing) {
      console.log(`⏭️  Skipping (already exists): ${stay.slug}`);
      continue;
    }

    const { sections, amenities, reviews, ...propertyData } = stay;

    // Upload section images to Cloudinary
    const processedSections = [];
    for (const section of sections) {
      let imageUrl = section.imageUrl;
      try {
        const folder = `3d-shortlet/nigeria/${stay.slug}`;
        console.log(`  📸 Uploading: ${section.name}...`);
        const result = await cloudinary.uploader.upload(section.imageUrl, {
          folder,
          public_id: section.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          overwrite: false,
          resource_type: 'image',
          fetch_format: 'auto',
          quality: 'auto:best',
        });
        imageUrl = result.secure_url;
        console.log(`  ✅ Uploaded: ${result.secure_url}`);
      } catch (err) {
        console.warn(`  ⚠️  Cloudinary upload failed for ${section.name}, using source URL`);
      }
      processedSections.push({ ...section, imageUrl });
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        neighborhoodHighlights: propertyData.neighborhoodHighlights || [],
        sections: {
          create: processedSections.map((s, idx) => ({
            name: s.name,
            type: s.type,
            imageUrl: s.imageUrl,
            order: idx,
            hotspots: s.hotspots || [],
          })),
        },
        amenities: {
          create: amenities.map((a) => ({ name: a.name, icon: a.icon })),
        },
      },
    });

    // Add reviews
    for (const review of reviews) {
      await prisma.review.create({
        data: {
          propertyId: property.id,
          guestName: review.guestName,
          guestAvatar: review.guestAvatar,
          rating: review.rating,
          comment: review.comment,
          stayDate: review.stayDate,
        },
      });
    }

    console.log(`✅ Created: ${stay.title} (${stay.slug})\n`);
  }

  console.log('🎉 Nigerian shortlet seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
