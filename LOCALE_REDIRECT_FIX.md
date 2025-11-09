# Locale Redirect Fix

## Problem

The application was experiencing a critical error when accessed with browser locale settings set to pt-BR (Portuguese Brazil) or other non-English locales:

**Browser Console Errors:**
```
HierarchyRequestError: Failed to execute 'appendChild' on 'Node': Only one element on document allowed.
NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
Uncaught AggregateError
```

**Symptoms:**
- Blank page when accessing the app
- Browser automatically redirecting to `/pt-BR/` or similar locale paths
- DOM manipulation errors in the console
- React rendering failure

## Root Cause

1. **Browser Locale Detection:** Modern browsers send an `Accept-Language` header with the user's preferred languages (e.g., `pt-BR,pt;q=0.9,en-US;q=0.8`)

2. **No i18n Configuration:** The application doesn't have internationalization (i18n) configured in Next.js

3. **Route Not Found:** When the browser or some middleware tried to access `/pt-BR/`, Next.js couldn't find a corresponding route

4. **React Rendering Error:** This caused React to fail rendering, creating DOM hierarchy errors because it tried to render components in an invalid state

## Solution

### 1. Updated Middleware (`middleware.ts`)

Added locale detection and redirect logic to the middleware:

```typescript
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

  return NextResponse.next()
}
```

**How it works:**
- Detects if the URL pathname starts with a locale code (e.g., `/pt-BR/`, `/es/`, `/fr/`)
- If a locale is detected, removes it from the path and redirects to the non-localized version
- Example: `/pt-BR/dashboard` → `/dashboard`
- Example: `/pt-BR/` → `/`

### 2. Updated Middleware Matcher

Changed the matcher to catch all routes (except static files):

```typescript
export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

This ensures the locale redirect logic runs for all incoming requests.

### 3. Maintained Auth Protection

The middleware still wraps the auth protection using `withAuth`:

```typescript
export default withAuth(middleware, {
  callbacks: {
    authorized: ({ token, req }) => {
      // Auth logic here
    },
  },
})
```

## Testing

To test the fix:

1. **Test with Portuguese locale:**
   - Open your browser's DevTools (F12)
   - Go to Settings → Languages
   - Add Portuguese (Brazil) to the top of your language preferences
   - Refresh the app
   - You should be automatically redirected from `/pt-BR/` to `/`

2. **Test direct URL access:**
   ```
   http://localhost:3000/pt-BR/
   http://localhost:3000/es/dashboard
   http://localhost:3000/fr/courses
   ```
   All should redirect to their non-localized versions.

3. **Verify no console errors:**
   - Open browser DevTools Console
   - Should see no HierarchyRequestError or DOM errors
   - Page should render correctly

## Future Enhancements

If you want to add proper internationalization support in the future:

1. **Use next-intl or next-i18next:**
   ```bash
   npm install next-intl
   ```

2. **Configure i18n in next.config.js:**
   ```javascript
   module.exports = {
     i18n: {
       locales: ['en', 'pt-BR', 'es'],
       defaultLocale: 'en',
     },
   }
   ```

3. **Create locale-specific layouts:**
   ```
   app/[locale]/layout.tsx
   app/[locale]/page.tsx
   ```

4. **Update middleware** to use proper i18n routing instead of redirects

## Related Issues

- P3009/P3018 - Prisma Migration Errors (separate issue, already fixed)
- React Hydration Errors - Can occur when server/client rendering mismatch

## References

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Browser Accept-Language Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language)
