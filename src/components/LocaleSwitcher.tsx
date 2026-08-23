'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  // Retirer la locale actuelle du chemin pour créer des liens propres
  // Ex: si pathname est "/fr/events", pathnameWithoutLocale sera "/events"
  const pathnameWithoutLocale = pathname === `/${locale}` ? '/' : pathname.replace(`/${locale}`, '');

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
      <Link 
        href={`/ar${pathnameWithoutLocale}`} 
        className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${locale === 'ar' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
      >
        العربية
      </Link>
      <Link 
        href={`/fr${pathnameWithoutLocale}`} 
        className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${locale === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
      >
        FR
      </Link>
      <Link 
        href={`/en${pathnameWithoutLocale}`} 
        className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${locale === 'en' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
      >
        EN
      </Link>
    </div>
  );
}
