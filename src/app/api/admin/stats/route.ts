import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/role-guard';

export async function GET() {
  const guard = await requireRole(['ADMIN']);
  if (guard.error) return guard.error;

  const totalRevenue = await prisma.reservation.aggregate({
    where: { status: 'PAID' },
    _sum: { totalPrice: true }
  });

  const totalTicketsSold = await prisma.reservation.count({
    where: { status: 'PAID' }
  });

  const totalTicketsUsed = await prisma.reservation.count({
    where: { status: 'USED' }
  });

  const events = await prisma.event.findMany({
    select: {
      id: true,
      nameFr: true,
      status: true,
      _count: {
        select: {
          reservations: { where: { status: 'PAID' } }
        }
      }
    }
  });

  return NextResponse.json({
    revenue: totalRevenue._sum.totalPrice ?? 0,
    ticketsSold: totalTicketsSold,
    ticketsUsed: totalTicketsUsed,
    events: events.map((e) => ({
      id: e.id,
      name: e.nameFr,
      status: e.status,
      sold: e._count.reservations
    }))
  });
}
