import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/redis';

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, category } = body;

    if (!eventId || !category) {
      return NextResponse.json(
        { error: 'eventId et category requis' },
        { status: 400 }
      );
    }

    // 1. Find an available seat in the requested category
    const availableSeat = await prisma.seat.findFirst({
      where: {
        eventId,
        category,
        status: 'AVAILABLE'
      },
      orderBy: { seatNumber: 'asc' }
    });

    if (!availableSeat) {
      return NextResponse.json(
        { error: 'Plus de places disponibles dans cette catégorie' },
        { status: 409 }
      );
    }

    // 2. Lock the seat and create the reservation atomically
    const reservation = await prisma.$transaction(async (tx) => {
      const seat = await tx.seat.findUnique({
        where: { id: availableSeat.id }
      });

      if (seat?.status !== 'AVAILABLE') {
        throw new HttpError('Place plus disponible', 409);
      }

      await tx.seat.update({
        where: { id: availableSeat.id },
        data: { status: 'LOCKED' }
      });

      // 3. Generate unique QR code data
      const qrCodeHash = randomUUID();
      const qrCodeData = JSON.stringify({
        eventId,
        seatId: availableSeat.id,
        hash: qrCodeHash,
        timestamp: Date.now()
      });

      // 4. Create the reservation (10 minutes to pay) with full addressing
      return await tx.reservation.create({
        data: {
          userId: session,
          eventId,
          seatId: availableSeat.id,
          entrance: availableSeat.entrance,
          gate: availableSeat.gate,
          access: availableSeat.access,
          block: availableSeat.block,
          rowLetter: availableSeat.rowLetter,
          seatLabel: String(availableSeat.seatNumber),
          qrCodeHash,
          qrCodeData,
          status: 'PAYMENT_PENDING',
          paymentMethod: null,
          paymentStatus: 'PENDING',
          price: availableSeat.price,
          fees: 10,
          totalPrice: Number(availableSeat.price) + 10,
          reservedUntil: new Date(Date.now() + 10 * 60 * 1000)
        },
        include: {
          seat: true,
          event: { include: { venue: true } }
        }
      });
    });

    return NextResponse.json({
      success: true,
      reservation,
      message:
        'Place réservée temporairement. Procédez au paiement dans les 10 minutes.'
    });
  } catch (error) {
    console.error('Reservation error:', error);
    const status = error instanceof HttpError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : 'Erreur lors de la réservation';
    return NextResponse.json({ error: message }, { status });
  }
}
