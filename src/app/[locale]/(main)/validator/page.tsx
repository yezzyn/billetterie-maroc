'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, ScanLine, Loader2, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ValidationResult {
  success: boolean;
  error?: string;
  isAlreadyUsed?: boolean;
  message?: string;
  data?: {
    eventName: string;
    userName: string;
    cin: string;
    seat: string;
    usedAt: string | null;
  };
}

export default function ValidatorPage() {
  const t = useTranslations('validator');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setResult(null);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          await scanner.clear().catch(console.error);
          setScanning(false);
          await validateTicket(decodedText);
        },
        () => {
          // Continuous camera read errors — ignore
        }
      );
    }, 100);
  };

  const validateTicket = async (qrData: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeData: qrData })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: t('networkError') });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setTimeout(startScanning, 300);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        <Card className="card-premium overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="scanner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  {!scanning ? (
                    <Button onClick={startScanning} size="lg" className="w-full py-8 text-lg">
                      <ScanLine className="me-2 h-6 w-6" />
                      {t('startScanner')}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div
                        id="qr-reader"
                        className="mx-auto max-w-sm overflow-hidden rounded-xl border-4 border-blue-500 shadow-xl"
                      />
                      <p className="text-sm text-gray-500">{t('placeInFrame')}</p>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          scannerRef.current?.clear().catch(console.error);
                          setScanning(false);
                        }}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-gray-600">{t('verifying')}</p>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  {result.success && result.data ? (
                    <div className="space-y-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-green-700">
                          {t('valid')} ✅
                        </h2>
                        <p className="mt-1 text-gray-600">{t('accessGranted')}</p>
                      </div>

                      <div className="space-y-4 rounded-xl bg-gray-50 p-6 text-start">
                        <div className="flex items-start gap-3">
                          <User className="mt-0.5 h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">{t('holder')}</p>
                            <p className="font-semibold text-gray-900">
                              {result.data.userName}
                            </p>
                            <p className="text-sm text-gray-600">CIN: {result.data.cin}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">{t('event')}</p>
                            <p className="font-semibold text-gray-900">
                              {result.data.eventName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t('seatLabel')}: {result.data.seat}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button onClick={resetScanner} className="w-full" size="lg">
                        {t('scanNext')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-12 w-12 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-red-700">
                          {result.isAlreadyUsed ? t('alreadyUsed') : t('invalid')}
                        </h2>
                        <p className="mt-1 text-gray-600">{result.error}</p>
                      </div>
                      <Button
                        onClick={resetScanner}
                        variant="destructive"
                        className="w-full"
                        size="lg"
                      >
                        {t('retry')}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
