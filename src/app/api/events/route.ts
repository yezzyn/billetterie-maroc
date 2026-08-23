import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: { in: ['PUBLISHED', 'OPEN', 'WAITING_ROOM'] } },
      include: { venue: true },
      orderBy: { eventDate: 'asc' }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
