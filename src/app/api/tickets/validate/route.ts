import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/role-guard';

class HttpError extends Error {
  status: number;
  isAlreadyUsed: boolean;
  constructor(message: string, status: number, isAlreadyUsed = false) {
    super(message);
    this.status = status;
    this.isAlreadyUsed = isAlreadyUsed;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only ADMIN and VALIDATOR roles may scan/validate tickets
    const guard = await requireRole(['ADMIN', 'VALIDATOR']);
    if (guard.error) return guard.error;

    const body = await req.json();
    const { qrCodeData } = body;

    if (!qrCodeData) {
      return NextResponse.json(
        { error: 'Données QR Code manquantes' },
        { status: 400 }
      );
    }

    let parsedData: { hash?: string; eventId?: string; seatId?: string };
    try {
      parsedData = JSON.parse(qrCodeData);
    } catch {
      return NextResponse.json({ error: 'Format QR Code invalide' }, { status: 400 });
    }

    const { hash, eventId, seatId } = parsedData;
    if (!hash || !eventId || !seatId) {
      return NextResponse.json({ error: 'Format QR Code invalide' }, { status: 400 });
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const res = await tx.reservation.findFirst({
        where: { qrCodeHash: hash, eventId, seatId },
        include: {
          user: {
            select: { firstNameAr: true, lastNameAr: true, cin: true, phone: true }
          },
          event: { select: { nameFr: true, nameAr: true, nameEn: true } },
          seat: { select: { section: true, rowNumber: true, seatNumber: true } }
        }
      });

      if (!res) {
        throw new HttpError('Billet introuvable ou falsifié', 404);
      }

      if (res.status === 'EXPIRED' || res.status === 'CANCELLED') {
        throw new HttpError('Ce billet a été annulé ou a expiré', 409);
      }

      if (res.status === 'USED') {
        throw new HttpError('BILLET_DEJA_UTILISE', 409, true);
      }

      if (res.status !== 'PAID') {
        throw new HttpError("Ce billet n'a pas été payé", 409);
      }

      // Mark as used (anti-fraud: single use)
      return await tx.reservation.update({
        where: { id: res.id },
        data: { status: 'USED', usedAt: new Date() },
        include: {
          user: {
            select: { firstNameAr: true, lastNameAr: true, cin: true, phone: true }
          },
          event: { select: { nameFr: true, nameAr: true, nameEn: true } },
          seat: { select: { section: true, rowNumber: true, seatNumber: true } }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Billet validé avec succès',
      data: {
        eventName: reservation.event.nameFr,
        userName: `${reservation.user.firstNameAr} ${reservation.user.lastNameAr}`,
        cin: reservation.user.cin,
        seat: reservation.seat
          ? `${reservation.seat.section} - R${reservation.seat.rowNumber} S${reservation.seat.seatNumber}`
          : '-',
        usedAt: reservation.usedAt
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, error: error.message, isAlreadyUsed: error.isAlreadyUsed },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
