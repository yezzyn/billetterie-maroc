'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import {
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';

interface Reservation {
  id: string;
  status: string;
  price: string;
  fees: string;
  totalPrice: string;
  reservedUntil: string;
  seat: { section: string; rowNumber: number; seatNumber: number };
  event: {
    eventDate: string;
    nameAr: string;
    nameFr: string;
    nameEn: string;
    venue: { nameAr: string; nameFr: string; nameEn: string };
  };
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('payment');
  const reservationId = searchParams.get('reservationId');

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('CMI');
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!reservationId) {
      router.push(`/${locale}/events`);
      return;
    }

    fetch(`/api/reservations/${reservationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.reservation.status === 'PAID') {
            router.push(`/${locale}/ticket/${reservationId}`);
          } else {
            setReservation(data.reservation);
          }
        } else {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(t('loadError'));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId, router, locale]);

  // Tick every minute to refresh the payment countdown (client-only to
  // avoid SSR hydration mismatch)
  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${reservationId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedMethod })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/${locale}/ticket/${reservationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="card-premium max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('error')}</h2>
          <p className="mb-6 text-gray-600">{error || t('notFound')}</p>
          <Button onClick={() => router.push(`/${locale}/events`)}>
            {t('backToEvents')}
          </Button>
        </Card>
      </div>
    );
  }

  const dateLocale = locale === 'ar' ? ar : locale === 'fr' ? fr : enUS;
  const suffix = locale === 'ar' ? 'Ar' : locale === 'fr' ? 'Fr' : 'En';
  const eventName = reservation.event[`name${suffix}`];
  const venueName = reservation.event.venue[`name${suffix}`];
  const timeLeft = Math.max(
    0,
    Math.floor((new Date(reservation.reservedUntil).getTime() - now) / 1000 / 60)
  );

  const paymentMethods = [
    { id: 'CMI', name: t('cmi'), icon: CreditCard, desc: t('cmiDesc') },
    { id: 'CASHPLUS', name: t('cashplus'), icon: Building2, desc: t('agencyPayment') },
    { id: 'WAFACASH', name: t('wafacash'), icon: Building2, desc: t('agencyPayment') },
    { id: 'BARIDCASH', name: t('baridcash'), icon: Smartphone, desc: t('postPayment') }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900 lg:text-4xl">
            {t('title')}
          </h1>
          <p className="mb-8 text-center text-gray-600">{t('subtitle')}</p>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Summary */}
            <div className="space-y-6 lg:col-span-3">
              <Card className="card-premium p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900">{t('summary')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{eventName}</p>
                      <p className="text-sm text-gray-500">{venueName}</p>
                      <p className="text-sm text-gray-500">
                        {format(
                          new Date(reservation.event.eventDate),
                          'd MMMM yyyy, HH:mm',
                          { locale: dateLocale }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-600">
                        {t('seatLabel', {
                          section: reservation.seat.section,
                          row: reservation.seat.rowNumber,
                          seat: reservation.seat.seatNumber
                        })}
                      </span>
                      <span className="shrink-0 font-medium">
                        {Number(reservation.price)} MAD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('serviceFees')}</span>
                      <span className="font-medium">
                        {Number(reservation.fees)} MAD
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-blue-600">
                      <span>{t('total')}</span>
                      <span>{Number(reservation.totalPrice)} MAD</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="card-premium p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900">{t('method')}</h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-start transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          selectedMethod === method.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle2 className="ms-auto h-6 w-6 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Action & Timer */}
            <div className="lg:col-span-2">
              <Card className="card-premium sticky top-24 p-6">
                <div className="mb-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <span className="text-2xl font-bold">{timeLeft}</span>
                  </div>
                  <p className="text-sm text-gray-600">{t('minutesLeft')}</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handlePay}
                  loading={paying}
                  className="mb-4 w-full"
                  size="lg"
                >
                  {t('pay', { amount: Number(reservation.totalPrice) })}
                </Button>

                <p className="text-center text-xs text-gray-500">{t('cgv')}</p>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
