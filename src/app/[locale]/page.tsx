'use client';

import { useTranslations } from 'next-intl';

export default function TestPage() {
  const t = useTranslations('home');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-blue-600">
          {t('title')}
        </h1>
        <p className="text-2xl text-gray-600">
          {t('subtitle')}
        </p>
        <div className="text-xl text-green-600 font-semibold">
          Si vous voyez ce texte en français, ça marche ! ✅
        </div>
      </div>
    </div>
  );
}
