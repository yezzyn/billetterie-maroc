import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // 1. Laisser next-intl gérer la redirection de langue en premier
  const response = intlMiddleware(request);
  
  // 2. Vérification d'authentification pour les routes protégées
  const pathname = request.nextUrl.pathname;
  if (pathname.includes('/dashboard') || pathname.includes('/validator')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Extraire la locale actuelle de l'URL (ex: "/fr/dashboard" -> "fr")
      const pathParts = pathname.split('/');
      const currentLocale = locales.includes(pathParts[1] as any) ? pathParts[1] : defaultLocale;
      
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return response;
}

export const config = {
  // Matcher tout SAUF les fichiers statiques et l'API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
