import { Session } from 'next-auth'
import { authorizationService } from './AuthorizationService'

/**
 * Check if session user has access to resource
 * @param session - NextAuth session
 * @param requiresPremium - Whether resource requires premium
 * @returns True if user has access
 */
export function checkResourceAccess(
  session: Session | null,
  requiresPremium: boolean
): boolean {
  return authorizationService.canAccess(
    session?.user?.subscription?.tier,
    session?.user?.subscription?.status,
    { requiresPremium }
  )
}

/**
 * Check if session user has premium access
 * @param session - NextAuth session
 * @returns True if user has active premium subscription
 */
export function hasPremiumAccess(session: Session | null): boolean {
  return checkResourceAccess(session, true)
}

/**
 * Filter array of resources based on user's access level
 * @param items - Array of items with isPremiumOnly property
 * @param session - NextAuth session
 * @returns Filtered array based on user's access
 */
export function filterByAccess<T extends { isPremiumOnly: boolean }>(
  items: T[],
  session: Session | null
): T[] {
  const hasPremium = hasPremiumAccess(session)

  if (hasPremium) {
    return items // Premium users see everything
  }

  // Free users only see non-premium items
  return items.filter((item) => !item.isPremiumOnly)
}
