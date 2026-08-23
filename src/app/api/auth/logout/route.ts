import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookie } from '@/lib/auth';
import { deleteSession } from '@/lib/redis';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      await deleteSession(token);
    }
    await clearAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
