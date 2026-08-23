'use client';

import { useState, useEffect } from 'react';
import { StadiumConfigurator } from '@/components/admin/StadiumConfigurator';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface VenueOption {
  id: string;
  nameFr: string;
  city: string;
}

export default function NewEventPage() {
  const locale = useLocale();
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [venueId, setVenueId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stadium-config')
      .then((res) => (res.ok ? res.json() : { venues: [] }))
      .then((data) => {
        setVenues(Array.isArray(data.venues) ? data.venues : []);
        if (Array.isArray(data.venues) && data.venues.length > 0) {
          setVenueId(data.venues[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Créer un nouvel événement
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : venues.length === 0 ? (
          <p className="text-gray-600">Aucun lieu disponible.</p>
        ) : (
          <div className="space-y-6">
            <div className="max-w-md">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lieu de l&apos;événement
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="input-premium"
                aria-label="Lieu"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nameFr} — {v.city}
                  </option>
                ))}
              </select>
            </div>

            <StadiumConfigurator key={venueId} venueId={venueId} />
          </div>
        )}
      </div>
    </div>
  );
}
