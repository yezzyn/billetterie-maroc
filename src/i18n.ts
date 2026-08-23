import { getRequestConfig } from 'next-intl/server';

// Source de vérité unique pour les langues
export const locales = ['ar', 'fr', 'en'] as const;
export const defaultLocale = 'ar';

export default getRequestConfig(async ({ locale }) => {
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
