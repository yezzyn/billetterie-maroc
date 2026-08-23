import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { storeOTP } from '@/lib/redis';
import { sendOtpSms } from '@/lib/otp';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().min(1, 'Téléphone requis'),
  password: z.string().min(1, 'Mot de passe requis')
});

function normalizePhone(phone: string): string {
  if (phone.startsWith('+212')) return phone;
  if (phone.startsWith('0')) return '+212' + phone.slice(1);
  return '+212' + phone;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);
    const phone = normalizePhone(validated.phone);

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || !(await verifyPassword(validated.password, user.password))) {
      return NextResponse.json(
        { error: 'Téléphone ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await storeOTP(phone, otp);

    await prisma.user.update({
      where: { phone },
      data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + 600000) }
    });

    await sendOtpSms(phone, otp);

    return NextResponse.json({
      success: true,
      requiresOTP: true,
      message: 'Code OTP envoyé à votre téléphone.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
