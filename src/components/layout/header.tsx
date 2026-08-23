'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from './language-switcher';
import { Menu, X, Ticket, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Transparent over the hero only on the home page
  const isHome = pathname === `/${locale}`;
  const overlayMode = isHome && !scrolled && !mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const href = (path: string) => `/${locale}${path}`;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-500',
        overlayMode ? 'bg-transparent' : 'glass shadow-lg'
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href={href('/')} className="group flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="gradient-primary shadow-blue-500/30 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
            >
              <Ticket className="h-7 w-7 text-white" />
            </motion.div>
            <span
              className={cn(
                'text-2xl font-bold transition-colors',
                overlayMode ? 'text-white' : 'text-gray-900'
              )}
            >
              {t('appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href={href('/events')}
              className={cn(
                'text-sm font-semibold transition-all hover:scale-105',
                overlayMode
                  ? 'text-white/90 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              )}
            >
              {t('events')}
            </Link>
            <Link
              href={href('/events')}
              className={cn(
                'text-sm font-semibold transition-all hover:scale-105',
                overlayMode
                  ? 'text-white/90 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              )}
            >
              {t('myTickets')}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher />
            <Link
              href={href('/login')}
              className={cn(
                'rounded-xl px-6 py-3 font-semibold transition-all',
                overlayMode
                  ? 'text-white hover:bg-white/20'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {t('login')}
            </Link>
            <Link href={href('/register')} className="btn-primary">
              {t('register')}
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'rounded-xl p-2 transition-colors lg:hidden',
              overlayMode ? 'hover:bg-white/20' : 'hover:bg-gray-100'
            )}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X
                className={cn(
                  'h-6 w-6',
                  overlayMode ? 'text-white' : 'text-gray-900'
                )}
              />
            ) : (
              <Menu
                className={cn(
                  'h-6 w-6',
                  overlayMode ? 'text-white' : 'text-gray-900'
                )}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-t lg:hidden"
          >
            <div className="space-y-4 px-6 py-6">
              <Link
                href={href('/events')}
                className="block py-2 text-base font-semibold text-gray-700 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('events')}
              </Link>
              <Link
                href={href('/events')}
                className="block py-2 text-base font-semibold text-gray-700 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('myTickets')}
              </Link>
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <LanguageSwitcher />
                <Link
                  href={href('/login')}
                  className="btn-secondary block w-full text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href={href('/register')}
                  className="btn-primary block w-full text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
