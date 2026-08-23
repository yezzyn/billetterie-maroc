import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Cairo, Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { locales } from '@/i18n/config';
import '../globals.css';

// Force le rendu dynamique pour éviter les bugs de cache i18n sur Vercel
export const dynamic = 'force-dynamic';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Billetterie Maroc',
  description: 'Application de billetterie pour le Maroc'
};

// 👇 SUPPRIMEZ LA FONCTION generateStaticParams D'ICI 👇

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!hasLocale(locales, locale)) {
    notFound();
  }
  
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? 'font-arabic' : 'font-latin';

  return (
    <html lang={locale} dir={dir}>
      <body className={`${cairo.variable} ${inter.variable} ${fontClass}`}>
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50 font-bold text-xl shadow-lg">
          LOCALE ACTIVE : {locale.toUpperCase()}
        </div>

        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
