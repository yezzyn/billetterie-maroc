'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import type { ComponentProps } from 'react';

// Link that automatically prefixes the current locale
export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  const path = typeof href === 'string' ? href : href.pathname ?? '';
  return <Link href={`/${locale}${path}`} {...props} />;
}
