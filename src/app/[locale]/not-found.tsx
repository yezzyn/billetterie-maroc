import { useTranslations } from 'next-intl';
import { SearchX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LocaleLink } from '@/components/layout/locale-link';

export default function NotFoundPage() {
  const t = useTranslations('common');

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex min-h-screen items-center justify-center p-6">
      <Card className="card-premium max-w-md p-8 text-center">
        <SearchX className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('notFoundTitle')}</h2>
        <p className="mb-6 text-gray-600">{t('notFoundDescription')}</p>
        <LocaleLink href="/" className="btn-primary">
          {t('backHome')}
        </LocaleLink>
      </Card>
    </div>
  );
}
