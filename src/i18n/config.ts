export const locales = ['ar', 'fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  fr: 'Français',
  en: 'English'
};

export const defaultLocale: Locale = 'ar';
