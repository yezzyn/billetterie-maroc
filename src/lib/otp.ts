import { prisma } from './prisma';

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send the OTP through Twilio in production, console.log in development.
// Shared by the auth API routes and sendOTP below.
export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.TWILIO_SID) {
    try {
      const twilio = await import('twilio');
      const client = twilio.default(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await client.messages.create({
        body: `Votre code OTP Billetterie Maroc : ${otp}. Valide 10 min.`,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
    } catch (error) {
      console.error('Twilio SMS failed:', error);
      console.log(`[FALLBACK] OTP for ${phone}: ${otp}`);
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
  }
}

export async function sendOTP(phone: string): Promise<boolean> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await sendOtpSms(phone, otp);

  await prisma.user.update({
    where: { phone },
    data: {
      otpCode: otp,
      otpExpiresAt: expiresAt
    }
  });

  return true;
}

export async function verifyOTP(phone: string, otp: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  if (!user || !user.otpCode || !user.otpExpiresAt) {
    return false;
  }

  if (user.otpCode !== otp) {
    return false;
  }

  if (new Date() > user.otpExpiresAt) {
    return false;
  }

  // Valid OTP: clear it and mark the user as verified
  await prisma.user.update({
    where: { phone },
    data: {
      otpCode: null,
      otpExpiresAt: null,
      isVerified: true
    }
  });

  return true;
}
