'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (newLocale: string) => {
    // 1. Enlever l'ancienne locale du chemin (ex: "/ar/events" devient "/events")
    // Si on est à la racine "/", pathnameWithoutLocale sera "/"
    const pathnameWithoutLocale = pathname === `/${locale}` ? '/' : pathname.replace(`/${locale}`, '');
    
    // 2. Construire le nouveau chemin (ex: "/fr" + "/events" = "/fr/events")
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    
    // 3. Naviguer et rafraîchir
    router.push(newPath);
    router.refresh();
  };

  return (
    <select
      value={locale}
      onChange={(e) => changeLocale(e.target.value)}
      className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
    >
      <option value="ar">🇲🇦 العربية</option>
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}
