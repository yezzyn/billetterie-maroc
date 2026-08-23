'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Calendar, MapPin, Ticket, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';

interface CategoryInfo {
  min: number;
  max: number;
}

interface EventDetail {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  eventDate: string;
  status: string;
  imageUrl: string | null;
  bannerUrl: string | null;
  maxTicketsPerUser: number;
  categories: Record<string, CategoryInfo>;
  venue: { nameAr: string; nameFr: string; nameEn: string; city: string };
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('events');
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data.error ? null : data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        {t('notFound')}
      </div>
    );
  }

  const dateLocale = locale === 'ar' ? ar : locale === 'fr' ? fr : enUS;
  const suffix = locale === 'ar' ? 'Ar' : locale === 'fr' ? 'Fr' : 'En';
  const eventName = event[`name${suffix}`];
  const venueName = event.venue[`name${suffix}`];

  const categories = Object.entries(event.categories || {}).map(([name, v]) => ({
    name,
    min: v.min,
    max: v.max
  }));

  const handleReserve = () => {
    if (!selectedCategory) return;
    router.push(
      `/${locale}/waiting-room?eventId=${event.id}&category=${encodeURIComponent(selectedCategory)}`
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen">
      {/* Banner */}
      <div className="relative h-[40vh] w-full overflow-hidden lg:h-[50vh]">
        <Image
          src={event.bannerUrl || event.imageUrl || ''}
          alt={eventName}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6 lg:p-12">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="mb-4 inline-block rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                {event.status === 'OPEN' ? t('ticketsAvailable') : t('saleSoon')}
              </span>
              <h1 className="mb-4 text-3xl font-bold text-white lg:text-5xl">
                {eventName}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {format(new Date(event.eventDate), 'd MMMM yyyy, HH:mm', {
                      locale: dateLocale
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {venueName} — {event.venue.city}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Info */}
          <div className="space-y-8 lg:col-span-2">
            <Card className="card-premium p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('about')}</h2>
              <p className="leading-relaxed text-gray-600">
                {event[`description${suffix}`]}
              </p>
            </Card>

            <Card className="card-premium p-8">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {t('practicalInfo')}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('ticketing')}</h3>
                    <p className="text-sm text-gray-600">{t('ticketingDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('security')}</h3>
                    <p className="text-sm text-gray-600">{t('securityDesc')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <Card className="card-premium sticky top-24 p-6">
              <h3 className="mb-6 text-xl font-bold text-gray-900">{t('book')}</h3>

              <div className="mb-6 space-y-3">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                      selectedCategory === cat.name
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <span className="font-semibold">{cat.name}</span>
                    <span className="font-bold">
                      {cat.min} - {cat.max} MAD
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <p>• {t('randomSeats')}</p>
                <p>• {t('maxTickets', { count: event.maxTicketsPerUser })}</p>
              </div>

              <Button onClick={handleReserve} className="w-full" size="lg" disabled={!selectedCategory}>
                {t('joinQueue')}
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Link href={`/${locale}/events/${params.id}/select-seats`} className="block">
                <Button variant="outline" className="mt-3 w-full" size="lg">
                  {t('chooseSeats')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
