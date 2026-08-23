import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Force la locale à être 'ar', 'fr' ou 'en', avec 'ar' par défaut
  const validLocale = (locale === 'ar' || locale === 'fr' || locale === 'en') ? locale : 'ar';
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
