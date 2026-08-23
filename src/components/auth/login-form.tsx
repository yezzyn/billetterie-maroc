'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2
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

const loginSchema = z.object({
  phone: z.string().min(1, 'required'),
  password: z.string().min(1, 'required')
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Normalize to E.164 (+212...) so the OTP API finds the same user
function normalizePhone(phone: string): string {
  if (phone.startsWith('+212')) return phone;
  if (phone.startsWith('0')) return '+212' + phone.slice(1);
  return '+212' + phone;
}

export function LoginForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('auth');
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' }
  });

  const onSubmitLogin = async (data: LoginFormValues) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
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
          {step === 'login' ? t('loginTitle') : t('verifyTitle')}
        </CardTitle>
        <CardDescription>
          {step === 'login' ? t('loginDesc') : t('otpSentTo', { phone })}
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

          {step === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit(onSubmitLogin)}
              className="space-y-4"
            >
              <Input
                label={t('phone')}
                placeholder={t('phonePlaceholder')}
                type="tel"
                inputMode="tel"
                icon={<Smartphone className="h-5 w-5" />}
                {...register('phone', { required: true })}
                error={errors.phone ? t('phone') : undefined}
              />
              <Input
                label={t('password')}
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                {...register('password', { required: true })}
                error={errors.password ? t('password') : undefined}
              />

              <Button type="submit" loading={loading} className="mt-6 w-full">
                {t('loginButton')}
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
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-blue-500" />
                <p className="mb-6 text-gray-600">{t('checkSms')}</p>
              </div>

              <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />

              <Button onClick={onSubmitOTP} loading={loading} className="w-full">
                {t('verifyAndAccess')}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('login');
                  setError('');
                  setOtp('');
                }}
                className="btn-ghost w-full text-sm"
              >
                {t('useOtherNumber')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center text-sm text-gray-600">
          {t('noAccount')}{' '}
          <Link
            href={`/${locale}/register`}
            className="font-semibold text-blue-600 hover:underline"
          >
            {t('registerLink')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
