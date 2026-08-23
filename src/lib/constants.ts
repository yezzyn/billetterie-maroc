// Regex for Moroccan national ID card (CIN): 1-2 letters followed by 5-6 digits
export const CIN_REGEX = /^[A-Za-z]{1,2}\d{5,6}$/;

// Moroccan mobile phone: +212 6XX-XXXXXX or 06XX-XXXXXX
export const PHONE_REGEX = /^(?:\+212|0)[5-7]\d{8}$/;

export const CURRENCIES = {
  MAD: 'MAD'
} as const;
