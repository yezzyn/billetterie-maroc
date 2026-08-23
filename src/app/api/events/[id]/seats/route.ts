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
        venue: {
          include: {
            zones: true
          }
        },
        seats: {
          select: {
            id: true,
            section: true,
            entrance: true,
            gate: true,
            access: true,
            block: true,
            rowLetter: true,
            rowNumber: true,
            seatNumber: true,
            status: true,
            price: true,
            category: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Zones with their bookable seats (matched by block)
    const zonesWithSeats = event.venue.zones.map((zone) => ({
      ...zone,
      seats: event.seats
        .filter((seat) => seat.block === zone.block)
        .map((seat) => ({
          id: seat.id,
          rowNumber: seat.rowLetter ?? String(seat.rowNumber),
          seatNumber: String(seat.seatNumber),
          status: seat.status.toLowerCase(),
          price: Number(seat.price),
          entrance: seat.entrance ?? zone.entrance,
          gate: seat.gate ?? zone.gate,
          access: seat.access ?? zone.access,
          block: seat.block ?? zone.block
        }))
    }));

    return NextResponse.json({
      venue: event.venue,
      zones: zonesWithSeats,
      seats: event.seats
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
