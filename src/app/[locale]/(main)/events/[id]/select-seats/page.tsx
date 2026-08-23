'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Info, CheckCircle2, Loader2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StadiumMap } from '@/components/stadium/StadiumMap';
import type { MapZone } from '@/components/stadium/StadiumMap';
import Link from 'next/link';

const MAX_SEATS = 4;

interface ZoneSeat {
  id: string;
  rowNumber: string;
  seatNumber: string;
  status: 'available' | 'locked' | 'sold';
  price: number;
  entrance?: string;
  gate?: string;
  access?: string;
  block?: string;
}

interface ApiZone {
  id: string;
  name: string;
  block: string;
  category: string;
  color: string;
  entrance: string;
  gate: string;
  seats: ZoneSeat[];
}

export default function SelectSeatsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('stadium');
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<ApiZone[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${params.id}/seats`)
      .then((res) => res.json())
      .then((data) => {
        const raw: ApiZone[] = Array.isArray(data.zones) ? data.zones : [];
        // Narrow seat status to the literal union expected by the map
        setZones(
          raw.map((z) => ({
            ...z,
            seats: z.seats.map((s) => ({
              ...s,
              status: (['available', 'locked', 'sold'].includes(s.status)
                ? s.status
                : 'available') as ZoneSeat['status']
            }))
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSeatSelect = (seatId: string) => {
    setLimitReached(false);
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= MAX_SEATS) {
        setLimitReached(true);
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const selectedSeatsData = zones.flatMap((z) => z.seats).filter((s) =>
    selectedSeats.includes(s.id)
  );
  const totalPrice = selectedSeatsData.reduce((sum, s) => sum + s.price, 0);

  const handleConfirm = () => {
    if (selectedSeats.length === 0) return;
    router.push(
      `/${locale}/waiting-room?eventId=${params.id}&seats=${selectedSeats.join(',')}`
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const mapZones: MapZone[] = zones.map((z) => ({
    id: z.id,
    name: z.name,
    block: z.block,
    category: z.category,
    color: z.color,
    entrance: z.entrance,
    gate: z.gate,
    seats: z.seats
  }));

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <Link
          href={`/${locale}/events/${params.id}`}
          className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('backToEvent')}
        </Link>

        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('hint')}</p>
          {limitReached && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {t('maxSeats', { count: MAX_SEATS })}
            </p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Stadium map */}
          <div className="lg:col-span-2">
            <StadiumMap
              zones={mapZones}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              maxSeats={MAX_SEATS}
            />
          </div>

          {/* Selection summary */}
          <div className="lg:col-span-1">
            <Card className="card-premium sticky top-24 bg-gradient-to-br from-white to-blue-50/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="from-blue-500 to-blue-600 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('yourSelection')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedSeats.length} / {MAX_SEATS}
                  </p>
                </div>
              </div>

              {selectedSeats.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-gray-400"
                >
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Info className="h-10 w-10 opacity-50" />
                  </div>
                  <p className="text-sm">{t('selectOnMap')}</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedSeatsData.map((seat) => {
                      const zone = zones.find((z) =>
                        z.seats.some((s) => s.id === seat.id)
                      );
                      return (
                        <motion.div
                          key={seat.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="mt-1 h-6 w-6 text-blue-600" />
                              <div>
                                <p className="font-bold text-gray-900">
                                  {seat.block ? `${t('block')} ${seat.block}` : zone?.name}
                                </p>
                                {seat.entrance && (
                                  <p className="text-xs text-gray-600">
                                    {t('entrance')} {seat.entrance} • {t('gate')}{' '}
                                    {seat.gate} • {t('access')} {seat.access}
                                  </p>
                                )}
                                <p className="mt-1 text-sm font-semibold text-gray-700">
                                  {t('row')} {seat.rowNumber} • {t('seat')}{' '}
                                  {seat.seatNumber}
                                </p>
                              </div>
                            </div>
                            <div className="text-end">
                              <p className="text-lg font-bold text-blue-600">
                                {seat.price} MAD
                              </p>
                              <button
                                onClick={() => handleSeatSelect(seat.id)}
                                aria-label="Remove"
                                className="mt-2 text-sm text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-gray-600">
                        {t('total')} ({selectedSeats.length})
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {totalPrice} MAD
                      </span>
                    </div>

                    <Button onClick={handleConfirm} className="w-full" size="lg">
                      {t('continueToPayment')}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
