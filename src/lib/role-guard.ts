import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/redis';

export type UserRole = 'USER' | 'VALIDATOR' | 'ADMIN';

export interface GuardUser {
  id: string;
  role: UserRole;
  firstNameAr: string | null;
  lastNameAr: string | null;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<{ error: NextResponse | null; user: GuardUser | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      user: null
    };
  }

  const userId = await getSession(token);
  if (!userId) {
    return {
      error: NextResponse.json({ error: 'Session expirée' }, { status: 401 }),
      user: null
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firstNameAr: true, lastNameAr: true }
  });

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return {
      error: NextResponse.json(
        { error: 'Accès refusé : privilèges insuffisants' },
        { status: 403 }
      ),
      user: null
    };
  }

  return { error: null, user };
}
