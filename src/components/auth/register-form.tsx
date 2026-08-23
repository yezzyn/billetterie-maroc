'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  User,
  Smartphone,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { OTPInput } from '@/components/ui/otp-input';
import Link from 'next/link';

const registerSchema = z
  .object({
    cin: z.string().regex(/^[A-Za-z]{1,2}\d{5,6}$/),
    firstNameAr: z.string().min(2),
    lastNameAr: z.string().min(2),
    phone: z.string().regex(/^(\+212|0)?(6|7)\d{8}$/),
    email: z.string().email().optional().or(z.literal('')),
    password: z.string().min(8),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword']
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// Normalize to E.164 (+212...) so the OTP API finds the same user
function normalizePhone(phone: string): string {
  if (phone.startsWith('+212')) return phone;
  if (phone.startsWith('0')) return '+212' + phone.slice(1);
  return '+212' + phone;
}

export function RegisterForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('auth');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      cin: '',
      firstNameAr: '',
      lastNameAr: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmitInfo = async (data: RegisterFormValues) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'error');

      setPhone(normalizePhone(data.phone));
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOTP = async () => {
    if (otp.length !== 6) {
      setError(t('otpLengthError'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'error');

      router.push(`/${locale}/events`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-premium mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-gradient text-2xl">
          {step === 'info' ? t('registerTitle') : t('verifyTitle')}
        </CardTitle>
        <CardDescription>
          {step === 'info' ? t('registerDesc') : t('otpSentTo', { phone })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {step === 'info' ? (
            <motion.form
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit(onSubmitInfo)}
              className="space-y-4"
            >
              <Input
                label={t('cin')}
                placeholder={t('cinPlaceholder')}
                icon={<User className="h-5 w-5" />}
                {...register('cin')}
                error={errors.cin ? t('cin') : undefined}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('firstName')}
                  placeholder={t('firstName')}
                  {...register('firstNameAr')}
                  error={errors.firstNameAr ? t('firstName') : undefined}
                />
                <Input
                  label={t('lastName')}
                  placeholder={t('lastName')}
                  {...register('lastNameAr')}
                  error={errors.lastNameAr ? t('lastName') : undefined}
                />
              </div>
              <Input
                label={t('phone')}
                placeholder={t('phonePlaceholder')}
                type="tel"
                inputMode="tel"
                icon={<Smartphone className="h-5 w-5" />}
                {...register('phone')}
                error={errors.phone ? t('phone') : undefined}
              />
              <Input
                label={t('emailOptional')}
                type="email"
                inputMode="email"
                placeholder="exemple@email.com"
                icon={<Mail className="h-5 w-5" />}
                {...register('email')}
                error={errors.email ? t('email') : undefined}
              />
              <Input
                label={t('password')}
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                {...register('password')}
                error={errors.password ? t('password') : undefined}
              />
              <Input
                label={t('confirmPassword')}
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                {...register('confirmPassword')}
                error={errors.confirmPassword ? t('confirmPassword') : undefined}
              />

              <Button type="submit" loading={loading} className="mt-6 w-full">
                {t('registerButton')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <p className="mb-6 text-gray-600">{t('checkSms')}</p>
              </div>

              <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />

              <Button onClick={onSubmitOTP} loading={loading} className="w-full">
                {t('verifyAndLogin')}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('info');
                  setError('');
                  setOtp('');
                }}
                className="btn-ghost w-full text-sm"
              >
                {t('changePhone')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center text-sm text-gray-600">
          {t('alreadyHaveAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="font-semibold text-blue-600 hover:underline"
          >
            {t('loginLink')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
