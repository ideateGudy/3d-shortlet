import { PrismaClient, Role, SectionType, BookingStatus, BlockReason } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 3D Shortlet database...');

  // 1. Create or update Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shortlet3d.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`✓ Admin user created/updated: ${admin.email}`);

  // 2. Define Properties & Sections
  const propertiesData = [
    {
      slug: 'obsidian-penthouse',
      title: 'The Obsidian Penthouse',
      tagLine: 'Ultra-luxurious high-rise sanctuary overlooking the metropolis',
      description:
        'Suspended 60 storeys above the vibrant city lights, The Obsidian Penthouse embodies contemporary dark-glass architecture with monolithic Italian marble, bespoke acoustic isolation, and an unobstructed 360-degree skyline horizon.',
      location: 'Manhattan Sky District, NY',
      bedrooms: 4,
      bathrooms: 5,
      maxGuests: 8,
      pricePerNight: 2850,
      cleaningFee: 350,
      minNights: 2,
      maxNights: 14,
      rules: 'No smoking, private cocktail events permitted upon prior concierge approval.',
      isFeatured: true,
      amenities: [
        { name: 'Private Helipad Access', icon: 'plane' },
        { name: '360° Skyline Terrace', icon: 'compass' },
        { name: 'Private Sommelier Wine Cellar', icon: 'wine' },
        { name: 'Acoustically Treated Screening Room', icon: 'tv' },
        { name: 'Private Wellness Spa & Sauna', icon: 'flame' },
        { name: '24/7 Dedicated Butler', icon: 'bell' },
      ],
      sections: [
        {
          key: 'arrival',
          name: 'Exterior Arrival',
          type: SectionType.PANORAMA,
          order: 0,
          initialYaw: 0,
          initialPitch: 0,
          hotspotLabels: [{ targetKey: 'living', label: 'Enter Penthouse', pos: [0.8, -0.1, -0.6] }],
        },
        {
          key: 'living',
          name: 'Grand Living Hall',
          type: SectionType.PANORAMA,
          order: 1,
          initialYaw: 0,
          initialPitch: 0,
          hotspotLabels: [
            { targetKey: 'bedroom', label: 'Master Suite', pos: [-0.85, 0.05, -0.5] },
            { targetKey: 'kitchen', label: 'Chef’s Kitchen', pos: [0.75, -0.05, -0.65] },
            { targetKey: 'terrace', label: 'Skyline Terrace', pos: [0.0, 0.0, 1.0] },
          ],
        },
        {
          key: 'bedroom',
          name: 'Master Sanctuary',
          type: SectionType.PANORAMA,
          order: 2,
          initialYaw: 0,
          initialPitch: 0,
          hotspotLabels: [
            { targetKey: 'bathroom', label: 'Spa Bathroom', pos: [0.8, -0.05, -0.6] },
            { targetKey: 'living', label: 'Return to Living Hall', pos: [-0.1, 0.0, -1.0] },
          ],
        },
        {
          key: 'kitchen',
          name: 'Chef’s Kitchen',
          type: SectionType.PHOTO,
          order: 3,
          initialYaw: 0,
          initialPitch: 0,
          hotspotLabels: [{ targetKey: 'living', label: 'Living Hall', pos: [-0.7, 0, 0.7] }],
        },
        {
          key: 'bathroom',
          name: 'Spa Bathroom',
          type: SectionType.PHOTO,
          order: 4,
          initialYaw: 0,
          initialPitch: 0,
          hotspotLabels: [{ targetKey: 'bedroom', label: 'Master Bedroom', pos: [0, 0, -1] }],
        },
        {
          key: 'terrace',
          name: 'Skyline Terrace',
          type: SectionType.PANORAMA,
          order: 5,
          initialYaw: 0,
          initialPitch: 0,
          hotspotLabels: [{ targetKey: 'living', label: 'Re-enter Penthouse', pos: [0, 0, -1] }],
        },
      ],
    },
    {
      slug: 'azure-cliffside-villa',
      title: 'Azure Cliffside Villa',
      tagLine: 'Sculpted organic cliffside estate with infinity sea horizon',
      description:
        'Carved into the sun-drenched volcanic cliffs, Azure combines organic lime-washed curves, cantilevered saltwater infinity pools, and seamless indoor-outdoor transitions framing the boundless turquoise waters.',
      location: 'Santorini Caldera, Greece',
      bedrooms: 5,
      bathrooms: 6,
      maxGuests: 10,
      pricePerNight: 3400,
      cleaningFee: 400,
      minNights: 3,
      maxNights: 21,
      rules: 'Children supervised at infinity edge. No commercial filming without permit.',
      isFeatured: true,
      amenities: [
        { name: 'Cantilevered Saltwater Pool', icon: 'waves' },
        { name: 'Submerged Cave Jacuzzi', icon: 'sparkles' },
        { name: 'Private Yacht Mooring', icon: 'anchor' },
        { name: 'Private Sunset Amphitheatre', icon: 'sunset' },
        { name: 'Mediterranean Herb Gardens', icon: 'flower' },
      ],
      sections: [
        { key: 'arrival', name: 'Cliff Path Arrival', type: SectionType.PANORAMA, order: 0, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Main Villa Entry', pos: [0.7, 0, -0.7] }] },
        { key: 'living', name: 'Caldera Living Room', type: SectionType.PANORAMA, order: 1, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bedroom', label: 'Master Suite', pos: [-0.8, 0, -0.6] }, { targetKey: 'terrace', label: 'Infinity Terrace', pos: [0, 0, 1] }] },
        { key: 'bedroom', name: 'Cliffside Master Bedroom', type: SectionType.PANORAMA, order: 2, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bathroom', label: 'Cave Bath', pos: [0.7, 0, -0.7] }, { targetKey: 'living', label: 'Living Room', pos: [0, 0, -1] }] },
        { key: 'kitchen', name: 'Open Summer Kitchen', type: SectionType.PHOTO, order: 3, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Living Room', pos: [-0.6, 0, 0.8] }] },
        { key: 'bathroom', name: 'Cave Bath & Rain Shower', type: SectionType.PHOTO, order: 4, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bedroom', label: 'Master Suite', pos: [0, 0, -1] }] },
        { key: 'terrace', name: 'Infinity Sea Terrace', type: SectionType.PANORAMA, order: 5, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Villa Lounge', pos: [0, 0, -1] }] },
      ],
    },
    {
      slug: 'komorebi-forest-sanctuary',
      title: 'Komorebi Forest Sanctuary',
      tagLine: 'Minimalist cedar timber pavilion nestled in ancient cedar groves',
      description:
        'A transcendent meditation on modern Japanese architecture. Crafted from charred yakisugi cedar, tatami-matted suites, and warm onsen mineral baths surrounded by mist-shrouded mountain pines.',
      location: 'Kyoto Highlands, Japan',
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      pricePerNight: 1950,
      cleaningFee: 250,
      minNights: 2,
      maxNights: 10,
      rules: 'Quiet sanctuary environment after 10 PM. No outdoor footwear inside.',
      isFeatured: true,
      amenities: [
        { name: 'Natural Hot Spring Onsen', icon: 'bath' },
        { name: 'Zen Rock Meditation Garden', icon: 'shield' },
        { name: 'Traditional Tea Ceremony Pavilion', icon: 'coffee' },
        { name: 'Hinoki Wood Soaking Tubs', icon: 'drop' },
        { name: 'Forest Forest Bathing Trail', icon: 'tree' },
      ],
      sections: [
        { key: 'arrival', name: 'Bamboo Path Arrival', type: SectionType.PANORAMA, order: 0, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Enter Pavilion', pos: [0.6, 0, -0.8] }] },
        { key: 'living', name: 'Engawa Timber Lounge', type: SectionType.PANORAMA, order: 1, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bedroom', label: 'Tatami Master Suite', pos: [-0.75, 0, -0.65] }, { targetKey: 'terrace', label: 'Forest Deck', pos: [0, 0, 1] }] },
        { key: 'bedroom', name: 'Tatami Master Suite', type: SectionType.PANORAMA, order: 2, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bathroom', label: 'Hinoki Bath', pos: [0.8, 0, -0.6] }, { targetKey: 'living', label: 'Lounge', pos: [0, 0, -1] }] },
        { key: 'kitchen', name: 'Tea & Culinary Studio', type: SectionType.PHOTO, order: 3, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Lounge', pos: [-0.5, 0, 0.8] }] },
        { key: 'bathroom', name: 'Hinoki Bath & Steam', type: SectionType.PHOTO, order: 4, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bedroom', label: 'Master Suite', pos: [0, 0, -1] }] },
        { key: 'terrace', name: 'Moss Garden Deck', type: SectionType.PANORAMA, order: 5, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Engawa Lounge', pos: [0, 0, -1] }] },
      ],
    },
    {
      slug: 'solis-desert-pavilion',
      title: 'Solis Desert Pavilion',
      tagLine: 'Mid-century glass and rammed earth pavilion in the silent desert',
      description:
        'Floating above the golden sands and Joshua trees, Solis features glass curtain walls, raw rammed-earth thermal mass, solar-warmed plunge pools, and uninterrupted night-sky stargazing.',
      location: 'Joshua Tree, California',
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      pricePerNight: 1650,
      cleaningFee: 200,
      minNights: 2,
      maxNights: 14,
      rules: 'Dark Sky reserve etiquette: outdoor lights off by 10 PM for stargazing.',
      isFeatured: false,
      amenities: [
        { name: 'Desert Plunge Pool', icon: 'sun' },
        { name: 'Astronomical Telescope Deck', icon: 'eye' },
        { name: 'Firepit Gathering Lounge', icon: 'flame' },
        { name: 'Floor-to-Ceiling Glass Walls', icon: 'grid' },
      ],
      sections: [
        { key: 'arrival', name: 'Desert Oasis Arrival', type: SectionType.PANORAMA, order: 0, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Enter Glass House', pos: [0.8, 0, -0.6] }] },
        { key: 'living', name: 'Glass Atrium Lounge', type: SectionType.PANORAMA, order: 1, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bedroom', label: 'Desert Master', pos: [-0.8, 0, -0.6] }, { targetKey: 'terrace', label: 'Stargazing Deck', pos: [0, 0, 1] }] },
        { key: 'bedroom', name: 'Desert Horizon Bedroom', type: SectionType.PANORAMA, order: 2, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bathroom', label: 'Indoor-Outdoor Bath', pos: [0.8, 0, -0.6] }, { targetKey: 'living', label: 'Atrium', pos: [0, 0, -1] }] },
        { key: 'kitchen', name: 'Monolithic Quartz Kitchen', type: SectionType.PHOTO, order: 3, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Atrium', pos: [-0.6, 0, 0.8] }] },
        { key: 'bathroom', name: 'Open Sky Rainfall Bath', type: SectionType.PHOTO, order: 4, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'bedroom', label: 'Desert Master', pos: [0, 0, -1] }] },
        { key: 'terrace', name: 'Stargazing Pavilion Deck', type: SectionType.PANORAMA, order: 5, initialYaw: 0, initialPitch: 0, hotspotLabels: [{ targetKey: 'living', label: 'Glass Atrium', pos: [0, 0, -1] }] },
      ],
    },
  ];

  for (const p of propertiesData) {
    // Upsert Property
    const property = await prisma.property.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        tagLine: p.tagLine,
        description: p.description,
        location: p.location,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        maxGuests: p.maxGuests,
        pricePerNight: p.pricePerNight,
        cleaningFee: p.cleaningFee,
        minNights: p.minNights,
        maxNights: p.maxNights,
        rules: p.rules,
        isFeatured: p.isFeatured,
      },
      create: {
        slug: p.slug,
        title: p.title,
        tagLine: p.tagLine,
        description: p.description,
        location: p.location,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        maxGuests: p.maxGuests,
        pricePerNight: p.pricePerNight,
        cleaningFee: p.cleaningFee,
        minNights: p.minNights,
        maxNights: p.maxNights,
        rules: p.rules,
        isFeatured: p.isFeatured,
      },
    });

    // Delete existing sections & amenities to avoid duplicates upon re-seed
    await prisma.amenity.deleteMany({ where: { propertyId: property.id } });
    await prisma.propertySection.deleteMany({ where: { propertyId: property.id } });

    // Insert Amenities
    for (const am of p.amenities) {
      await prisma.amenity.create({
        data: {
          propertyId: property.id,
          name: am.name,
          icon: am.icon,
        },
      });
    }

    // Insert Sections (first pass to get IDs)
    const sectionKeyToId: Record<string, string> = {};
    for (const sec of p.sections) {
      const created = await prisma.propertySection.create({
        data: {
          propertyId: property.id,
          name: sec.name,
          order: sec.order,
          type: sec.type,
          imageUrl: `/placeholders/${p.slug}-${sec.key}.jpg`,
          initialYaw: sec.initialYaw,
          initialPitch: sec.initialPitch,
          hotspots: [],
        },
      });
      sectionKeyToId[sec.key] = created.id;
    }

    // Update hotspots with actual target IDs
    for (const sec of p.sections) {
      const sectionId = sectionKeyToId[sec.key];
      const hotspots = sec.hotspotLabels.map((h, idx) => ({
        id: `hs-${p.slug}-${sec.key}-${idx}`,
        targetSectionId: sectionKeyToId[h.targetKey] || sectionId,
        label: h.label,
        position: h.pos,
      }));

      await prisma.propertySection.update({
        where: { id: sectionId },
        data: { hotspots },
      });
    }

    // Add 1 sample CONFIRMED booking and 1 sample Blocked Date
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 10);
    const nextMonthCheckOut = new Date(today.getFullYear(), today.getMonth() + 1, 14);

    const blockStart = new Date(today.getFullYear(), today.getMonth() + 1, 20);
    const blockEnd = new Date(today.getFullYear(), today.getMonth() + 1, 23);

    // Delete existing sample bookings for clean state
    await prisma.booking.deleteMany({ where: { propertyId: property.id } });
    await prisma.blockedDate.deleteMany({ where: { propertyId: property.id } });

    await prisma.booking.create({
      data: {
        propertyId: property.id,
        guestName: 'Eleanor Vance',
        guestEmail: 'eleanor@vance-holdings.com',
        guestPhone: '+1 555-019-2834',
        adults: 2,
        children: 0,
        checkIn: nextMonth,
        checkOut: nextMonthCheckOut,
        status: BookingStatus.CONFIRMED,
        totalPrice: property.pricePerNight * 4 + property.cleaningFee,
        cleaningFee: property.cleaningFee,
        nights: 4,
        notes: 'VIP guest - champagne on arrival requested.',
      },
    });

    await prisma.blockedDate.create({
      data: {
        propertyId: property.id,
        startDate: blockStart,
        endDate: blockEnd,
        reason: BlockReason.MAINTENANCE,
      },
    });

    console.log(`✓ Seeded property: ${p.title} (${p.sections.length} sections, amenities, booking, block)`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
