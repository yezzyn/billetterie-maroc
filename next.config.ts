import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

// Pointe vers le fichier unifié que nous venons de créer
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
