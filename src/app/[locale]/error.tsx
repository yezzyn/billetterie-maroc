'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LocaleErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations('common');

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex min-h-screen items-center justify-center p-6">
      <Card className="card-premium max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('errorTitle')}</h2>
        <p className="mb-6 text-gray-600">{t('errorDescription')}</p>
        <Button onClick={reset}>{t('confirm')}</Button>
      </Card>
    </div>
  );
}
