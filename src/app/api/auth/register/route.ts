import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { storeOTP } from '@/lib/redis';
import { sendOtpSms } from '@/lib/otp';
import { z } from 'zod';

const registerSchema = z.object({
  cin: z.string().regex(/^[A-Za-z]{1,2}\d{5,6}$/, 'Format CIN invalide (ex: AB123456)'),
  firstNameAr: z.string().min(2, 'Prénom requis'),
  lastNameAr: z.string().min(2, 'Nom requis'),
  phone: z.string().regex(/^(\+212|0)?(6|7)\d{8}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  password: z.string().min(8, 'Mot de passe trop court (8 caractères min)')
});

function normalizePhone(phone: string): string {
  if (phone.startsWith('+212')) return phone;
  if (phone.startsWith('0')) return '+212' + phone.slice(1);
  return '+212' + phone;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);
    const phone = normalizePhone(validated.phone);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ cin: validated.cin.toUpperCase() }, { phone }]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'CIN ou numéro de téléphone déjà enregistré' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(validated.password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await storeOTP(phone, otp);

    const user = await prisma.user.create({
      data: {
        cin: validated.cin.toUpperCase(),
        firstNameAr: validated.firstNameAr,
        lastNameAr: validated.lastNameAr,
        phone,
        email: validated.email || null,
        password: hashedPassword,
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 600000)
      },
      select: { id: true, cin: true, phone: true, email: true, isVerified: true }
    });

    await sendOtpSms(phone, otp);

    return NextResponse.json({
      success: true,
      user,
      message: 'Inscription réussie. Un code OTP a été envoyé à votre téléphone.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Register error:', error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription" },
      { status: 500 }
    );
  }
}
