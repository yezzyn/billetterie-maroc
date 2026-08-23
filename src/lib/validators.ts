import { z } from 'zod';

// Moroccan CIN validation (format: 1-2 letters + 5-6 digits, e.g. AB123456)
export const cinSchema = z
  .string()
  .regex(/^[A-Za-z]{1,2}\d{5,6}$/, 'Format CIN invalide (ex: AB123456)')
  .transform((val) => val.toUpperCase());

// Moroccan phone validation
export const phoneSchema = z
  .string()
  .regex(/^(\+212|0)?(6|7)\d{8}$/, 'Numéro de téléphone marocain invalide')
  .transform((val) => {
    if (val.startsWith('+212')) return val;
    if (val.startsWith('0')) return '+212' + val.slice(1);
    return '+212' + val;
  });

// Registration schema
export const registerSchema = z
  .object({
    cin: cinSchema,
    firstNameAr: z.string().min(2, 'Prénom requis'),
    lastNameAr: z.string().min(2, 'Nom requis'),
    phone: phoneSchema,
    password: z.string().min(8, 'Mot de passe trop court (8 caractères min)'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  });

// Login schema
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Mot de passe requis')
});

// OTP schema
export const otpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'Code OTP doit contenir 6 chiffres')
});
