'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { locales, type Locale } from '@/i18n/config';

export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      const segments = pathname.split('/');
      // Replace the locale segment (first segment after the leading slash)
      if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
        segments[1] = newLocale;
      } else {
        segments.splice(1, 0, newLocale);
      }
      router.push(segments.join('/'));
    },
    [pathname, router]
  );

  return { locale, switchLocale, isRtl: locale === 'ar' };
}
