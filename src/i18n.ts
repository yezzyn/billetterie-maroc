import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Force la locale à être une string valide
  const validLocale = locale === 'fr' ? 'fr' : locale === 'en' ? 'en' : 'ar';
  
  // Import dynamique avec le bon fichier
  const messages = await import(`../messages/${validLocale}.json`);
  
  return {
    locale: validLocale,
    messages: messages.default
  };
});
