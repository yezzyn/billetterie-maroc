'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react'; // Assurez-vous d'avoir lucide-react, sinon retirez cette ligne

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (newLocale: string) => {
    // Remplace l'ancienne locale (ex: /ar) par la nouvelle (ex: /fr) dans l'URL
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
      <Globe className="h-4 w-4 text-gray-600" />
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer appearance-none"
      >
        <option value="ar">العربية</option>
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
