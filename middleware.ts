import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of locale patterns to redirect (app is English-only)
const locales = ['pt-BR', 'pt', 'es', 'en-US', 'en-GB', 'fr', 'de', 'it', 'ja', 'zh']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If path has a locale prefix, redirect to the path without locale
  if (pathnameHasLocale) {
    const locale = locales.find(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (locale) {
      // Remove the locale from the pathname
      const newPathname = pathname.replace(`/${locale}`, '') || '/'
      const url = req.nextUrl.clone()
      url.pathname = newPathname
      return NextResponse.redirect(url)
    }
  }

  // Use the default response for all other cases
  // Auth protection is handled by the matcher config below
  return NextResponse.next()
}

// Wrap with auth for protected routes
export default withAuth(middleware, {
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname

      // Public routes that don't require auth
      if (
        path === '/' ||
        path.startsWith('/auth') ||
        path.startsWith('/api/auth') ||
        path.startsWith('/_next') ||
        path.startsWith('/public')
      ) {
        return true
      }

      // Protected routes require a token
      if (path.startsWith('/dashboard')) {
        return !!token
      }

      // All other routes are accessible
      return true
    },
  },
})

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
