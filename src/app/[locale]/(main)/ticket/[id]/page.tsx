'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Download,
  Share2,
  Loader2,
  AlertTriangle,
  Ticket as TicketIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCode } from '@/components/ui/qr-code';
import { TicketPDF } from '@/components/pdf/TicketPDF';
import QRCodeLib from 'qrcode';
import { format } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';

interface Reservation {
  id: string;
  status: string;
  qrCodeData: string;
  price: string;
  totalPrice: string;
  entrance?: string | null;
  gate?: string | null;
  access?: string | null;
  block?: string | null;
  rowLetter?: string | null;
  seatLabel?: string | null;
  seat: {
    section: string;
    rowNumber: number;
    seatNumber: number;
    category?: string;
    entrance?: string | null;
    gate?: string | null;
    access?: string | null;
    block?: string | null;
    rowLetter?: string | null;
  };
  user?: { firstNameAr: string | null; lastNameAr: string | null; cin: string };
  event: {
    eventDate: string;
    nameAr: string;
    nameFr: string;
    nameEn: string;
    venue: { nameAr: string; nameFr: string; nameEn: string };
  };
}

export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('ticket');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    fetch(`/api/reservations/${params.id}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && data.reservation.status === 'PAID') {
          setReservation(data.reservation);
          // Pre-generate the QR Code data URL for the PDF
          try {
            const url = await QRCodeLib.toDataURL(data.reservation.qrCodeData, {
              width: 300,
              margin: 1
            });
            setQrDataUrl(url);
          } catch {
            // PDF download will simply be unavailable
          }
        } else {
          setError(data.error || t('notFoundOrUnpaid'));
        }
        setLoading(false);
      })
      .catch(() => {
        setError('error');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDownloadPDF = async () => {
    if (!reservation || !qrDataUrl) return;
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <TicketPDF reservation={reservation} qrCodeDataUrl={qrDataUrl} locale={locale} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Billet-${reservation.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
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
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('denied')}</h2>
          <p className="mb-6 text-gray-600">{error || t('notFoundOrUnpaid')}</p>
          <Button onClick={() => router.push(`/${locale}/events`)}>
            {t('backToList')}
          </Button>
        </Card>
      </div>
    );
  }

  const dateLocale = locale === 'ar' ? ar : locale === 'fr' ? fr : enUS;
  const suffix = locale === 'ar' ? 'Ar' : locale === 'fr' ? 'Fr' : 'En';
  const eventName = reservation.event[`name${suffix}`];
  const venueName = reservation.event.venue[`name${suffix}`];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-12">
      <div className="container mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              {t('paidConfirmed')}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('ready')}</h1>
            <p className="mt-2 text-gray-600">{t('presentQr')}</p>
          </div>

          <Card className="card-premium overflow-hidden">
            {/* Ticket header */}
            <div className="gradient-primary relative overflow-hidden p-6 text-center text-white">
              <div className="absolute top-0 left-0 h-full w-full opacity-10">
                <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-white blur-2xl" />
              </div>
              <TicketIcon className="mx-auto mb-3 h-12 w-12 opacity-90" />
              <h2 className="text-2xl font-bold">{eventName}</h2>
              <p className="mt-1 text-sm text-white/80">{venueName}</p>
            </div>

            {/* Ticket body */}
            <CardContent className="p-8">
              <div className="mb-8 flex flex-col items-center">
                <QRCode value={reservation.qrCodeData} size={220} />
                <p className="mt-4 font-mono text-xs text-gray-400">
                  {t('id', { id: reservation.id.slice(0, 8).toUpperCase() })}
                </p>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-6">
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <p className="mb-1 text-xs tracking-wider text-gray-500 uppercase">
                    {t('date')}
                  </p>
                  <p className="font-bold text-gray-900">
                    {format(new Date(reservation.event.eventDate), 'dd MMM', {
                      locale: dateLocale
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(reservation.event.eventDate), 'HH:mm', {
                      locale: dateLocale
                    })}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <p className="mb-1 text-xs tracking-wider text-gray-500 uppercase">
                    {t('place')}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {reservation.seat.section}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('rowSeat', {
                      row: reservation.seat.rowNumber,
                      seat: reservation.seat.seatNumber
                    })}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">{t('important')}</p>
                  <p className="mt-1 text-xs text-amber-800">{t('importantDesc')}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleDownloadPDF}
                  disabled={!qrDataUrl}
                >
                  <Download className="me-2 h-4 w-4" />
                  {t('downloadPdf')}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="me-2 h-4 w-4" />
                  {t('share')}
                </Button>
              </div>
            </CardContent>

            {/* Perforated footer */}
            <div className="relative h-6 bg-gray-50">
              <div className="absolute top-0 left-0 flex w-full justify-between px-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="-mt-2 h-4 w-4 rounded-full bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50"
                  />
                ))}
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => router.push(`/${locale}/events`)}>
              {t('backToList')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
