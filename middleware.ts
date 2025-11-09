import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales } from './i18n'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if the pathname already has a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If the path doesn't have a locale and is not a special path, it will be handled by app/page.tsx
  // which redirects to the default locale. Just let it through.

  // Continue with normal request flow
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
        path.startsWith('/public') ||
        path.match(/^\/(en|pt-BR)\/?$/) || // Locale home pages
        path.match(/^\/(en|pt-BR)\/(auth|subscribe|events|courses|services)/) // Public locale pages
      ) {
        return true
      }

      // Protected routes require a token
      if (path.match(/^\/(en|pt-BR)\/dashboard/)) {
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
