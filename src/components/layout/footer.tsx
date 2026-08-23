'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  Ticket,
  ThumbsUp,
  AtSign,
  Camera,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('footer');
  const tc = useTranslations('common');
  const locale = useLocale();
  const href = (path: string) => `/${locale}${path}`;

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">{tc('appName')}</span>
            </div>
            <p className="text-sm text-gray-400">{t('description')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href={href('/events')} className="transition-colors hover:text-white">
                  {tc('events')}
                </Link>
              </li>
              <li>
                <Link href={href('/')} className="transition-colors hover:text-white">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={href('/')} className="transition-colors hover:text-white">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href={href('/')} className="transition-colors hover:text-white">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">{t('contactTitle')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('phone')}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('email')}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('address')}
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-semibold">{t('followUs')}</h3>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-blue-600"
              >
                <ThumbsUp className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-blue-600"
              >
                <AtSign className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-blue-600"
              >
                <Camera className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 {tc('appName')}. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
