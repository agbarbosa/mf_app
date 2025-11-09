import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

const authMiddleware = withAuth(
  function middleware(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow access to public pages
        if (
          path === '/' ||
          path.startsWith('/auth') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/_next') ||
          path.startsWith('/en') ||
          path.startsWith('/pt-BR')
        ) {
          return true;
        }
        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public routes that don't need auth but need i18n
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(\/auth|\/subscribe|\/courses|\/events|\/services)?/?$`,
    'i'
  );

  const isPublicPage = publicPathnameRegex.test(path);

  if (isPublicPage) {
    return intlMiddleware(req);
  }

  // Protected routes need both i18n and auth
  return (authMiddleware as any)(req);
}

export const config = {
  matcher: ['/', '/(pt-BR|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}
