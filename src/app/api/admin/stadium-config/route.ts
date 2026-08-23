import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/role-guard';

interface ZoneInput {
  name?: string;
  category?: string;
  shape?: string;
  position?: { x: number; y: number; width: number; height: number; rotation?: number };
  color?: string;
  borderColor?: string | null;
  rows?: number;
  seatsPerRow?: number;
  rowLabeling?: string;
  entrance?: string | null;
  gate?: string | null;
  access?: string | null;
  block?: string;
  price?: number;
}

// GET: list venues (for the configurator's venue selector)
export async function GET() {
  const guard = await requireRole(['ADMIN']);
  if (guard.error) return guard.error;

  const venues = await prisma.venue.findMany({
    select: { id: true, nameFr: true, city: true },
    orderBy: { nameFr: 'asc' }
  });
  return NextResponse.json({ venues });
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['ADMIN']);
  if (guard.error) return guard.error;

  try {
    const body = (await req.json()) as {
      venueId?: string;
      name?: string;
      shape?: string;
      fieldWidth?: number;
      fieldLength?: number;
      zones?: ZoneInput[];
    };

    const { venueId, name, shape, fieldWidth, fieldLength, zones } = body;

    if (!venueId || !name || !Array.isArray(zones) || zones.length === 0) {
      return NextResponse.json(
        { error: 'venueId, name et au moins une zone sont requis' },
        { status: 400 }
      );
    }

    const validZones = zones.filter((z) => z.name && z.block);

    const config = await prisma.$transaction(async (tx) => {
      const created = await tx.stadiumConfig.create({
        data: {
          venueId,
          name,
          shape: shape ?? 'oval',
          fieldWidth: fieldWidth ?? 105,
          fieldLength: fieldLength ?? 68,
          totalCapacity: validZones.reduce(
            (sum, z) => sum + (z.rows ?? 10) * (z.seatsPerRow ?? 20),
            0
          )
        }
      });

      for (const z of validZones) {
        await tx.stadiumZoneConfig.create({
          data: {
            configId: created.id,
            name: z.name!,
            category: z.category ?? 'CAT3',
            shape: z.shape ?? 'rectangle',
            position: (z.position ?? { x: 100, y: 100, width: 200, height: 100 }) as object,
            color: z.color ?? '#3b82f6',
            borderColor: z.borderColor ?? null,
            rows: z.rows ?? 10,
            seatsPerRow: z.seatsPerRow ?? 20,
            rowLabeling: z.rowLabeling ?? 'letters',
            entrance: z.entrance ?? null,
            gate: z.gate ?? null,
            access: z.access ?? null,
            block: z.block!,
            price: z.price ?? 150
          }
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error saving stadium config:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
