# i18n Root Route Fix

## Problem

After implementing internationalization (i18n) with `next-intl`, the application was experiencing critical errors:

**Browser Console Errors:**
```
GET http://localhost:3000/ 404 (Not Found)
Uncaught Error: Minified React error #418
Uncaught Error: Minified React error #423
HierarchyRequestError: Failed to execute 'appendChild' on 'Node'
NotFoundError: Failed to execute 'removeChild' on 'Node'
Uncaught AggregateError
```

**Root Cause:**

When i18n was implemented, the app structure changed from:
```
app/
  ├── page.tsx          # Homepage (before i18n)
  ├── layout.tsx
  └── ...
```

To:
```
app/
  ├── [locale]/
  │   ├── page.tsx      # Homepage (after i18n)
  │   ├── layout.tsx
  │   └── ...
  └── (no root page.tsx!)  ❌
```

**The Issues:**

1. **Missing Root Handler**: No `app/page.tsx` existed to handle requests to `/`
2. **404 Error**: Visiting `http://localhost:3000/` returned 404
3. **Middleware Conflict**: The middleware was redirecting AWAY from locale paths (`/en/`, `/pt-BR/`) instead of allowing them
4. **Hydration Cascade**: The 404 triggered React hydration errors because the page couldn't load at all

## Solution

### 1. Created Root Page Handler (`app/page.tsx`)

Created a root page that:
- Detects the user's preferred language from the `Accept-Language` header
- Redirects to the appropriate locale route (`/en/` or `/pt-BR/`)
- Falls back to English (`/en/`) if no preference is detected

```typescript
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { locales } from '@/i18n';

export default function RootPage() {
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  let preferredLocale = 'en'; // Default locale

  // Simple locale matching
  if (acceptLanguage.includes('pt-BR') || acceptLanguage.includes('pt')) {
    preferredLocale = 'pt-BR';
  }

  // Ensure the preferred locale is supported
  const locale = locales.includes(preferredLocale as any) ? preferredLocale : 'en';

  // Redirect to the locale-specific homepage
  redirect(`/${locale}`);
}
```

**How it works:**
1. User visits `http://localhost:3000/`
2. Root page reads their `Accept-Language` header
3. If header contains `pt-BR` or `pt`, redirects to `/pt-BR/`
4. Otherwise, redirects to `/en/`
5. User sees the correct localized homepage

### 2. Fixed Middleware to Support i18n Routes

**Before (Broken):**
```typescript
// This was REMOVING locale prefixes, breaking i18n!
const locales = ['pt-BR', 'pt', 'es', ...] // WRONG - these are now valid routes!

if (pathnameHasLocale) {
  // Remove the locale from the pathname
  const newPathname = pathname.replace(`/${locale}`, '') || '/'
  return NextResponse.redirect(url) // ❌ Breaking i18n!
}
```

**After (Fixed):**
```typescript
import { locales } from './i18n' // Use actual supported locales ['en', 'pt-BR']

export function middleware(req: NextRequest) {
  // Check if pathname has a valid locale, but DON'T redirect it away
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Just continue - let i18n routes work normally
  return NextResponse.next()
}
```

**Key Changes:**
- Removed the logic that was stripping locale prefixes
- Now imports actual supported locales from `i18n.ts` (`['en', 'pt-BR']`)
- Updated auth protection patterns to include locale prefixes:
  - `/dashboard` → `/en/dashboard` or `/pt-BR/dashboard`
  - `/auth/signin` → `/en/auth/signin` or `/pt-BR/auth/signin`

### 3. Updated Auth Route Patterns

Updated the middleware auth callbacks to recognize locale-prefixed routes:

```typescript
authorized: ({ token, req }) => {
  const path = req.nextUrl.pathname

  // Public routes
  if (
    path === '/' ||
    path.startsWith('/api/auth') ||
    path.match(/^\/(en|pt-BR)\/?$/) || // Locale home pages
    path.match(/^\/(en|pt-BR)\/(auth|subscribe|events|courses|services)/)
  ) {
    return true
  }

  // Protected routes
  if (path.match(/^\/(en|pt-BR)\/dashboard/)) {
    return !!token
  }

  return true
}
```

## File Structure After Fix

```
app/
  ├── page.tsx                    # NEW: Root handler (redirects to locale)
  ├── providers.tsx
  ├── globals.css
  ├── [locale]/
  │   ├── page.tsx               # Localized homepage
  │   ├── layout.tsx             # Localized layout
  │   ├── dashboard/
  │   │   └── page.tsx           # /en/dashboard or /pt-BR/dashboard
  │   ├── auth/
  │   │   ├── signin/page.tsx    # /en/auth/signin or /pt-BR/auth/signin
  │   │   └── signup/page.tsx    # /en/auth/signup or /pt-BR/auth/signup
  │   └── ...
  └── api/
      └── auth/                   # NextAuth API routes (no locale needed)
```

## Route Examples

### Before Fix (Broken)
```
http://localhost:3000/           → 404 Error ❌
http://localhost:3000/en/        → Redirected to / ❌ (by broken middleware)
http://localhost:3000/pt-BR/     → Redirected to / ❌ (by broken middleware)
```

### After Fix (Working)
```
http://localhost:3000/           → Redirects to /en/ or /pt-BR/ ✅
http://localhost:3000/en/        → Shows English homepage ✅
http://localhost:3000/pt-BR/     → Shows Portuguese homepage ✅
http://localhost:3000/en/auth/signin     → Shows English sign-in page ✅
http://localhost:3000/pt-BR/dashboard    → Shows Portuguese dashboard (if authenticated) ✅
```

## Testing

After applying the fix:

1. **Clear browser cache** (important!)
2. **Rebuild and restart Docker containers:**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

3. **Test root route:**
   - Visit `http://localhost:3000/`
   - Should redirect to `/en/` or `/pt-BR/` based on browser language
   - No 404 error
   - Homepage loads correctly

4. **Test locale routes:**
   - Visit `http://localhost:3000/en/`
   - Visit `http://localhost:3000/pt-BR/`
   - Both should load the localized homepage

5. **Test language switcher:**
   - Click language switcher in header
   - Should switch between English and Portuguese
   - Content should update to the selected language

6. **Check browser console:**
   - Should see NO errors
   - No hydration errors
   - No 404 errors

### Expected Results

- ✅ No 404 error for root route
- ✅ Automatic redirect to user's preferred locale
- ✅ No React error #418 or #423
- ✅ No hydration errors
- ✅ All locale routes work correctly
- ✅ Language switcher works
- ✅ Auth protection works on locale routes

## Configuration Files

### i18n.ts
```typescript
export const locales = ['en', 'pt-BR'] as const;
export type Locale = (typeof locales)[number];
```

### next.config.js
```javascript
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
}

module.exports = withNextIntl(nextConfig)
```

## Related Issues Fixed

This fix resolves all the following issues that appeared after i18n implementation:

1. ✅ **404 on root route** - Fixed by adding `app/page.tsx`
2. ✅ **Locale routes being redirected away** - Fixed by updating middleware
3. ✅ **React hydration errors** - Fixed by resolving the 404 (page now loads)
4. ✅ **Auth routes not working** - Fixed by updating auth patterns to include locale
5. ✅ **Language detection not working** - Fixed by implementing Accept-Language parsing

## Best Practices for i18n Routes

### ✅ Do This
```typescript
// Link to locale routes
<Link href="/dashboard">Dashboard</Link>
// next-intl automatically adds the current locale prefix

// Or explicitly include locale
<Link href="/en/dashboard">Dashboard</Link>
<Link href="/pt-BR/dashboard">Painel</Link>
```

### ❌ Don't Do This
```typescript
// Don't strip locale prefixes in middleware
pathname.replace(`/${locale}`, '')

// Don't forget locale in route protection
if (path === '/dashboard') // ❌ Won't match /en/dashboard
if (path.includes('/dashboard')) // ✅ Better, but use regex for precision
if (path.match(/^\/(en|pt-BR)\/dashboard/)) // ✅ Best
```

## Additional Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Accept-Language Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
