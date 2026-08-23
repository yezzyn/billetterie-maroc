'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (newLocale: string) => {
    // Retirer l'ancienne locale du chemin (ex: "/ar/events" -> "/events")
    const pathnameWithoutLocale = pathname === `/${locale}` ? '/' : pathname.replace(`/${locale}`, '');
    
    // Construire le nouveau chemin (ex: "/fr" + "/events" = "/fr/events")
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    
    // Forcer la navigation et le rechargement complet pour que next-intl recharge les messages
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
      <Globe className="h-4 w-4 text-white" />
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer appearance-none"
      >
        <option value="ar" className="text-gray-900">العربية</option>
        <option value="fr" className="text-gray-900">Français</option>
        <option value="en" className="text-gray-900">English</option>
      </select>
    </div>
  );
}
