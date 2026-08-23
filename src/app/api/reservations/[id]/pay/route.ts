import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/redis';

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const VALID_METHODS = ['CMI', 'CASHPLUS', 'WAFACASH', 'BARIDCASH'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { paymentMethod } = body;

    if (!paymentMethod || !VALID_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      );
    }

    // Simulated payment (CMI/CashPlus/etc. integration comes later)
    const reservation = await prisma.$transaction(async (tx) => {
      const res = await tx.reservation.findUnique({
        where: { id },
        include: { seat: true }
      });

      if (!res || res.userId !== session) {
        throw new HttpError('Réservation non trouvée ou non autorisée', 404);
      }

      if (res.status !== 'PAYMENT_PENDING') {
        throw new HttpError('Cette réservation ne peut pas être payée', 409);
      }

      if (res.reservedUntil && new Date() > res.reservedUntil) {
        // Release the seat when the payment window has expired
        if (res.seatId) {
          await tx.seat.update({
            where: { id: res.seatId },
            data: { status: 'AVAILABLE' }
          });
        }
        await tx.reservation.update({
          where: { id },
          data: { status: 'EXPIRED' }
        });
        throw new HttpError(
          'Le délai de paiement a expiré. La place a été libérée.',
          410
        );
      }

      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentMethod: paymentMethod as 'CMI',
          paymentStatus: 'COMPLETED',
          paidAt: new Date()
        },
        include: {
          seat: true,
          event: { include: { venue: true } }
        }
      });

      // Mark the seat as sold
      if (res.seatId) {
        await tx.seat.update({
          where: { id: res.seatId },
          data: { status: 'SOLD' }
        });
      }

      return updatedReservation;
    });

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Paiement réussi ! Votre billet est prêt.'
    });
  } catch (error) {
    console.error('Payment error:', error);
    const status = error instanceof HttpError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : 'Erreur lors du paiement';
    return NextResponse.json({ error: message }, { status });
  }
}
