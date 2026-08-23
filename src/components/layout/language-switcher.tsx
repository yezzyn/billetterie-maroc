'use client';

import { locales, localeNames } from '@/i18n/config';
import { useLocaleSwitch } from '@/hooks/use-locale';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, switchLocale } = useLocaleSwitch();

  return (
    <div className="glass flex items-center gap-1 rounded-lg p-1">
      <Globe className="mx-1 h-4 w-4 text-gray-500" />
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`rounded-md px-3 py-1 text-sm transition-colors ${
            locale === l
              ? 'gradient-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  );
}
