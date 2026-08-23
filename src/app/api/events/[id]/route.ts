import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        seats: {
          select: { category: true, price: true },
          distinct: ['category']
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Group prices by category
    const categories = event.seats.reduce<
      Record<string, { min: number; max: number }>
    >((acc, seat) => {
      const price = Number(seat.price);
      if (!acc[seat.category]) {
        acc[seat.category] = { min: price, max: price };
      } else {
        acc[seat.category].min = Math.min(acc[seat.category].min, price);
        acc[seat.category].max = Math.max(acc[seat.category].max, price);
      }
      return acc;
    }, {});

    return NextResponse.json({ ...event, categories });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
