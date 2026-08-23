'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Clock, Users, Ticket, Loader2, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// useSearchParams requires a Suspense boundary during prerendering
export default function WaitingRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <WaitingRoomContent />
    </Suspense>
  );
}

function WaitingRoomContent() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('waiting');
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const category = searchParams.get('category');
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [eventName, setEventName] = useState<string | null>(null);
  const [position, setPosition] = useState(247);
  const [total] = useState(1842);
  const [estimatedTime, setEstimatedTime] = useState(134); // seconds
  const [isActive, setIsActive] = useState(false);

  // Only authenticated users may join the waiting room
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push(`/${locale}/login?callbackUrl=/${locale}/waiting-room`);
        }
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, [router, locale]);

  useEffect(() => {
    // Real-time simulation (will be replaced by WebSocket/polling)
    const interval = setInterval(() => {
      setPosition((prev) => Math.max(1, prev - Math.floor(Math.random() * 3)));
      setEstimatedTime((prev) => Math.max(0, prev - 1));
    }, 3000);

    const timeout = setTimeout(() => setIsActive(true), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!eventId) return;
    const suffix = locale === 'ar' ? 'Ar' : locale === 'fr' ? 'Fr' : 'En';
    fetch(`/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setEventName(data[`name${suffix}`]);
      })
      .catch(() => {});
  }, [eventId, locale]);

  // When the position reaches 1, wait 2s then create the reservation
  useEffect(() => {
    if (position !== 1 || isRedirecting || !eventId || !category) return;
    const timeout = setTimeout(async () => {
      setIsRedirecting(true);
      try {
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, category })
        });
        const data = await res.json();
        if (data.success) {
          router.push(`/${locale}/payment?reservationId=${data.reservation.id}`);
        } else {
          setError(data.error || 'error');
          setIsRedirecting(false);
        }
      } catch {
        setError('network error');
        setIsRedirecting(false);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [position, eventId, category, locale, router, isRedirecting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  const progress = ((total - position) / total) * 100;

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex min-h-screen items-center justify-center p-6">
        <Card className="card-premium max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('loginRequired')}</h2>
          <p className="mb-6 text-gray-600">{t('loginRequiredDesc')}</p>
          <Button
            onClick={() =>
              router.push(`/${locale}/login?callbackUrl=/${locale}/waiting-room`)
            }
          >
            {t('loginButton')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="mb-6 inline-flex items-center gap-3 rounded-full bg-blue-100 px-6 py-3 font-semibold text-blue-700"
            >
              <Users className="h-6 w-6" />
              {t('title')}
            </motion.div>
            <h1 className="mb-4 text-5xl font-bold text-gray-900">{t('almost')}</h1>
            <p className="text-xl text-gray-600">{t('patience')}</p>
            {(eventName || category) && (
              <p className="mt-4 text-lg font-semibold text-blue-700">
                {eventName}
                {category ? ` — ${category}` : ''}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          {/* Main Card */}
          <Card className="card-premium mb-8">
            <CardHeader className="pb-8 text-center">
              <motion.div
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-4 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-xl font-bold text-white shadow-xl"
              >
                <Ticket className="h-8 w-8" />
                {t('position', { position })}
              </motion.div>
              <p className="text-lg text-gray-600">
                {t('ofWaiting', { count: total.toLocaleString() })}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Progress Bar */}
              <div className="space-y-3">
                <Progress value={progress} max={100} showLabel={false} />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('start')}</span>
                  <span>{t('yourTurn')}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-center text-white shadow-xl"
                >
                  <Users className="mx-auto mb-3 h-10 w-10 opacity-80" />
                  <div className="text-3xl font-bold">{total.toLocaleString()}</div>
                  <div className="text-sm text-blue-100">{t('waitingCount')}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 text-center text-white shadow-xl"
                >
                  <Clock className="mx-auto mb-3 h-10 w-10 opacity-80" />
                  <div className="text-3xl font-bold">{formatTime(estimatedTime)}</div>
                  <div className="text-sm text-cyan-100">{t('estimatedTime')}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 p-6 text-center text-white shadow-xl"
                >
                  <Loader2
                    className={`mx-auto mb-3 h-10 w-10 opacity-80 ${isActive ? 'animate-spin' : ''}`}
                  />
                  <div className="text-3xl font-bold">
                    {position <= 10 ? t('soon') : t('inProgress')}
                  </div>
                  <div className="text-sm text-teal-100">{t('status')}</div>
                </motion.div>
              </div>

              {/* Info Box */}
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-amber-900">{t('dontLeave')}</h3>
                    <p className="text-amber-800">{t('dontLeaveDesc')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-glass p-6">
              <h3 className="mb-3 font-bold text-gray-900">{t('tipTitle')}</h3>
              <p className="text-gray-600">{t('tipDesc')}</p>
            </Card>
            <Card className="card-glass p-6">
              <h3 className="mb-3 font-bold text-gray-900">{t('fastTitle')}</h3>
              <p className="text-gray-600">{t('fastDesc')}</p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
