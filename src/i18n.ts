import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './i18n/config';

export default getRequestConfig(async ({ locale }) => {
  // On force TypeScript à comprendre que validLocale est TOUJOURS une string
  const validLocale: string = (locale && locales.includes(locale as any)) ? locale : defaultLocale;
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
