import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Let next-intl handle locale routing
  // Auth protection is handled by the withAuth wrapper below
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

      // Extract the locale from the path (e.g., /en/dashboard or /pt-BR/dashboard)
      const pathWithoutLocale = path.replace(/^\/(en|pt-BR)/, '')

      // Protected routes require a token
      if (pathWithoutLocale.startsWith('/dashboard')) {
        return !!token
      }

      // All other routes are accessible
      return true
    },
  },
})

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
