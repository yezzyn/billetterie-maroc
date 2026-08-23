import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  console.log('Seeding database...');

  // 0. Test users (Admin & Validator)
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { phone: '+212600000000' },
    update: {},
    create: {
      cin: 'AD000001',
      firstNameAr: 'Administrateur',
      lastNameAr: 'Système',
      phone: '+212600000000',
      email: 'admin@billetterie.ma',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true
    }
  });

  const validatorPassword = await bcrypt.hash('Valid123!', 12);
  await prisma.user.upsert({
    where: { phone: '+212600000001' },
    update: {},
    create: {
      cin: 'VL000001',
      firstNameAr: 'Agent',
      lastNameAr: 'Sécurité',
      phone: '+212600000001',
      email: 'validator@billetterie.ma',
      password: validatorPassword,
      role: 'VALIDATOR',
      isVerified: true
    }
  });
  console.log('Created admin (+212600000000 / Admin123!) and validator (+212600000001 / Valid123!)');

  // 1. Venue
  const venue = await prisma.venue.upsert({
    where: { id: 'venue-stade-mohammed-v' },
    update: {},
    create: {
      id: 'venue-stade-mohammed-v',
      nameAr: 'ملعب محمد الخامس',
      nameFr: 'Stade Mohammed V',
      nameEn: 'Mohammed V Stadium',
      address: 'Bd Abou Bakr Seddik, Casablanca',
      city: 'Casablanca',
      capacity: 45000,
      imageUrl:
        'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=1000'
    }
  });

  // 2. Event
  const event = await prisma.event.upsert({
    where: { id: 'event-finale-coupe-du-trone' },
    update: {},
    create: {
      id: 'event-finale-coupe-du-trone',
      nameAr: 'نهائي كأس العرش: الرجاء الرياضي ضد الوداد البيضاوي',
      nameFr: 'Finale Coupe du Trône : Raja CA vs Wydad AC',
      nameEn: 'Throne Cup Final: Raja CA vs Wydad AC',
      descriptionAr: 'المباراة الأكثر انتظارا في الموسم المغربي.',
      descriptionFr: "Le classico marocain. Vivez l'expérience au cœur du stade.",
      descriptionEn: 'The most anticipated match of the season in Morocco.',
      venueId: venue.id,
      eventDate: new Date('2026-11-20T20:00:00Z'),
      startTime: '20:00',
      status: 'OPEN',
      imageUrl:
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000',
      bannerUrl:
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=1200',
      maxTicketsPerUser: 4,
      saleStartDate: new Date('2026-10-01T00:00:00Z'),
      saleEndDate: new Date('2026-11-20T18:00:00Z'),
      priceMin: 100,
      priceMax: 500
    }
  });

  // 3. Seats by category (bulk insert)
  const existingSeats = await prisma.seat.count({
    where: { eventId: event.id }
  });

  if (existingSeats === 0) {
    const categories = [
      { section: 'Tribune Honneur', seats: 20, price: 500, category: 'VIP' },
      { section: 'Tribune A', seats: 50, price: 250, category: 'Premium' },
      { section: 'Tribune B', seats: 100, price: 150, category: 'Standard' },
      { section: 'Virage Sud', seats: 200, price: 100, category: 'Populaire' }
    ];

    for (const cat of categories) {
      for (let r = 1; r <= 5; r++) {
        await prisma.seat.createMany({
          data: Array.from({ length: cat.seats }, (_, s) => ({
            venueId: venue.id,
            eventId: event.id,
            section: cat.section,
            rowNumber: r,
            seatNumber: s + 1,
            category: cat.category,
            price: cat.price
          }))
        });
      }
    }
    console.log(`Created ${categories.reduce((a, c) => a + c.seats * 5, 0)} seats`);
  } else {
    console.log(`Seats already exist (${existingSeats}), skipping`);
  }

  // 4. Stadium layout — Moroccan standard (Entrance/Gate/Access/Block/CAT)
  const zoneCount = await prisma.stadiumZone.count({ where: { venueId: venue.id } });

  if (zoneCount === 0) {
    console.log('Creating stadium layout (Moroccan standard)...');

    const zones = [
      // CAT1 - VIP (Tribune Honneur)
      { name: 'Tribune Honneur', entrance: 'E01', gate: '10', access: '02', block: '305', category: 'CAT1', price: 500, color: '#ef4444', rows: 10, seatsPerRow: 30 },
      { name: 'Tribune Honneur Est', entrance: 'E01', gate: '17', access: '03', block: '313', category: 'CAT1', price: 500, color: '#dc2626', rows: 8, seatsPerRow: 25 },
      // CAT2 - Premium
      { name: 'Tribune A', entrance: 'E02', gate: '12', access: '05', block: '201', category: 'CAT2', price: 250, color: '#3b82f6', rows: 12, seatsPerRow: 35 },
      { name: 'Tribune B', entrance: 'E02', gate: '14', access: '07', block: '225', category: 'CAT2', price: 250, color: '#2563eb', rows: 12, seatsPerRow: 35 },
      // CAT3 - Standard/Populaire
      { name: 'Virage Sud', entrance: '2', gate: 'K', access: '07', block: '139', category: 'CAT3', price: 150, color: '#10b981', rows: 15, seatsPerRow: 40 },
      { name: 'Virage Nord', entrance: '2', gate: 'L', access: '09', block: '105', category: 'CAT3', price: 150, color: '#059669', rows: 15, seatsPerRow: 40 }
    ];

    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    for (const z of zones) {
      const zone = await prisma.stadiumZone.create({
        data: {
          venueId: venue.id,
          name: z.name,
          entrance: z.entrance,
          gate: z.gate,
          access: z.access,
          block: z.block,
          category: z.category,
          price: z.price,
          color: z.color,
          rows: z.rows,
          seatsPerRow: z.seatsPerRow
        }
      });

      await prisma.stadiumSeat.createMany({
        data: Array.from({ length: z.rows * z.seatsPerRow }, (_, k) => ({
          zoneId: zone.id,
          rowLetter: rowLetters[Math.floor(k / z.seatsPerRow)],
          seatNumber: String((k % z.seatsPerRow) + 1),
          status: 'active'
        })),
        skipDuplicates: true
      });
    }
    console.log(`Stadium created with ${zones.length} zones (blocks: ${zones.map((z) => z.block).join(', ')})`);

    // Remap event seats onto zones with full addressing (category/prices kept)
    const categoryToZones: Record<string, typeof zones> = {
      VIP: zones.filter((z) => z.category === 'CAT1'),
      Premium: zones.filter((z) => z.category === 'CAT2'),
      Standard: zones.filter((z) => z.category === 'CAT3'),
      Populaire: zones.filter((z) => z.category === 'CAT3')
    };

    for (const [category, catZones] of Object.entries(categoryToZones)) {
      if (catZones.length === 0) continue;
      const categorySeats = await prisma.seat.findMany({
        where: { eventId: event.id, category },
        select: { id: true, rowNumber: true },
        orderBy: [{ rowNumber: 'asc' }, { seatNumber: 'asc' }]
      });
      for (let k = 0; k < categorySeats.length; k++) {
        const z = catZones[k % catZones.length];
        await prisma.seat.update({
          where: { id: categorySeats[k].id },
          data: {
            section: z.name,
            entrance: z.entrance,
            gate: z.gate,
            access: z.access,
            block: z.block,
            rowLetter: rowLetters[(categorySeats[k].rowNumber - 1) % 26]
          }
        });
      }
    }
    console.log('Event seats remapped with full addressing (CAT1/CAT2/CAT3)');
  } else {
    console.log(`Stadium zones already exist (${zoneCount}), skipping`);
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
