import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/role-guard';

const VALID_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'WAITING_ROOM',
  'OPEN',
  'CLOSED',
  'CANCELLED'
] as const;

type EventStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(['ADMIN']);
  if (guard.error) return guard.error;

  const { id } = await params;
  const { status } = (await req.json()) as { status?: string };

  if (!status || !VALID_STATUSES.includes(status as EventStatus)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  try {
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: status as EventStatus },
      select: { id: true, nameFr: true, nameAr: true, status: true }
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Event status update error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
