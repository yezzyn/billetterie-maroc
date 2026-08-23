import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/redis';

export async function GET(
  _req: NextRequest,
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

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        seat: true,
        event: { include: { venue: true } },
        user: { select: { firstNameAr: true, lastNameAr: true, cin: true } }
      }
    });

    if (!reservation || reservation.userId !== session) {
      return NextResponse.json({ error: 'Billet non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Get reservation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
