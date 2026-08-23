import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Cairo, Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { locales } from '@/i18n/config';
import '../globals.css';

export const dynamic = 'force-dynamic';

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo'
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Billetterie Maroc',
  description: 'Application de billetterie pour le Maroc'
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
        // ... vos imports existants ...

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? 'font-arabic' : 'font-latin';

  return (
    <html lang={locale} dir={dir}>
      <body className={fontClass}>
        {/* 👇 AJOUTEZ CE DEBUG BADGE ICI 👇 */}
        <div className="fixed top-0 right-0 bg-red-600 text-white px-4 py-2 z-50 font-bold text-xl">
          LOCALE ACTIVE : {locale.toUpperCase()}
        </div>
        {/* 👆 FIN DU DEBUG BADGE 👆 */}

        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
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
