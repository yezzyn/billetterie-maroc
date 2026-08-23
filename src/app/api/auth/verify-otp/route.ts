import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { verifyAndDeleteOTP, createSession } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Téléphone et OTP requis' },
        { status: 400 }
      );
    }

    const isValid = await verifyAndDeleteOTP(phone, otp);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Code OTP invalide ou expiré' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { phone },
      data: { isVerified: true, lastLoginAt: new Date() },
      select: {
        id: true,
        cin: true,
        phone: true,
        email: true,
        firstNameAr: true,
        lastNameAr: true
      }
    });

    const token = await generateToken(user.id);
    await createSession(user.id, token);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user,
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
