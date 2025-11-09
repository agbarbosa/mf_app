import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { locales } from '@/i18n';

export default function RootPage() {
  // Get the Accept-Language header to determine user's preferred language
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Parse Accept-Language header to find best matching locale
  let preferredLocale = 'en'; // Default locale

  // Simple locale matching - check if pt-BR or pt is preferred
  if (acceptLanguage.includes('pt-BR') || acceptLanguage.includes('pt')) {
    preferredLocale = 'pt-BR';
  }

  // Ensure the preferred locale is supported
  const locale = locales.includes(preferredLocale as any) ? preferredLocale : 'en';

  // Redirect to the locale-specific homepage
  redirect(`/${locale}`);
}
