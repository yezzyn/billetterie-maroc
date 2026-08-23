'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Calendar, MapPin, ArrowRight, Search, SearchX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';

interface EventItem {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  eventDate: string;
  status: string;
  imageUrl: string | null;
  priceMin: string;
  venue: {
    nameAr: string;
    nameFr: string;
    nameEn: string;
    city: string;
  };
}

function EventSkeleton() {
  return (
    <div className="card-premium overflow-hidden">
      <div className="h-56 animate-pulse bg-gray-200" />
      <div className="space-y-3 p-6">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="flex justify-between pt-4">
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const locale = useLocale();
  const t = useTranslations('events');
  const tc = useTranslations('common');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dateLocale = locale === 'ar' ? ar : locale === 'fr' ? fr : enUS;
  const suffix = locale === 'ar' ? 'Ar' : locale === 'fr' ? 'Fr' : 'En';

  const cities = useMemo(
    () => Array.from(new Set(events.map((e) => e.venue.city))).sort(),
    [events]
  );

  const filtered = useMemo(() => {
    let list = events;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e[`name${suffix}`].toLowerCase().includes(q));
    }
    if (city) list = list.filter((e) => e.venue.city === city);
    return [...list].sort((a, b) =>
      sortBy === 'date'
        ? new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        : Number(a.priceMin) - Number(b.priceMin)
    );
  }, [events, search, city, sortBy, suffix]);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </motion.div>

        {/* Filters */}
        <div className="card-premium mb-8 grid gap-4 p-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tc('search')}
              aria-label={tc('search')}
              className="input-premium ps-12"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label={t('city')}
            className="input-premium md:w-48"
          >
            <option value="">{tc('allCities')}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'price')}
            aria-label={tc('sortBy')}
            className="input-premium md:w-44"
          >
            <option value="date">
              {tc('sortBy')}: {tc('sortDate')}
            </option>
            <option value="price">
              {tc('sortBy')}: {tc('sortPrice')}
            </option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <EventSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-premium mx-auto max-w-md p-12 text-center">
            <SearchX className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg font-semibold text-gray-600">{tc('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-premium group flex h-full flex-col overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={
                        event.imageUrl ||
                        'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800'
                      }
                      alt={event[`name${suffix}`]}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 end-4">
                      <span className="badge badge-gradient shadow-lg">
                        {event.status === 'OPEN' ? tc('open') : tc('soon')}
                      </span>
                    </div>
                  </div>

                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>
                        {format(new Date(event.eventDate), 'd MMMM yyyy, HH:mm', {
                          locale: dateLocale
                        })}
                      </span>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                      {event[`name${suffix}`]}
                    </h3>

                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span>
                        {event.venue[`name${suffix}`]} — {event.venue.city}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-xs text-gray-500">{tc('from')}</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {Number(event.priceMin)}{' '}
                          <span className="text-sm font-normal text-gray-600">MAD</span>
                        </p>
                      </div>
                      <Link href={`/${locale}/events/${event.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="transition-colors group-hover:bg-blue-600 group-hover:text-white"
                        >
                          {tc('details')}
                          <ArrowRight className="ms-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
