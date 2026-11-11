import { PrismaClient, BookingStatus } from '@prisma/client';

describe('Booking Concurrency & Double-Booking Prevention', () => {
  let prisma: PrismaClient;
  let propertyId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    const property = await prisma.property.findFirst({
      where: { slug: 'obsidian-penthouse' },
    });
    if (!property) {
      throw new Error('Seed property obsidian-penthouse not found');
    }
    propertyId = property.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('prevents two simultaneous overlapping bookings via PostgreSQL btree_gist exclusion constraint', async () => {
    const checkIn = new Date('2027-05-10');
    const checkOut = new Date('2027-05-15');

    // Clean up any test booking for this test range
    await prisma.booking.deleteMany({
      where: {
        propertyId,
        checkIn,
        checkOut,
      },
    });

    const createBooking = async (guestName: string, email: string) => {
      return prisma.booking.create({
        data: {
          propertyId,
          guestName,
          guestEmail: email,
          guestPhone: '+1 555-010-9999',
          adults: 2,
          children: 0,
          checkIn,
          checkOut,
          status: BookingStatus.CONFIRMED,
          totalPrice: 10000,
          cleaningFee: 350,
          nights: 5,
        },
      });
    };

    // Execute two simultaneous conflicting bookings
    const results = await Promise.allSettled([
      createBooking('User Alpha', 'alpha@concurrency-test.com'),
      createBooking('User Beta', 'beta@concurrency-test.com'),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one must succeed, and one must be rejected by PostgreSQL exclusion constraint
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
    // Postgres exclusion constraint error code 23P01
    const isExclusionError =
      rejectedReason?.code === '23P01' ||
      rejectedReason?.message?.includes('no_overlapping_bookings') ||
      rejectedReason?.message?.includes('exclusion');

    expect(isExclusionError).toBe(true);

    // Verify database only has 1 record for these dates
    const count = await prisma.booking.count({
      where: {
        propertyId,
        checkIn,
        checkOut,
      },
    });
    expect(count).toBe(1);

    // Cleanup
    await prisma.booking.deleteMany({
      where: {
        propertyId,
        checkIn,
        checkOut,
      },
    });
  });
});
