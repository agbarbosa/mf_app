import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

export function hasAccess(
  tier: SubscriptionTier | undefined,
  status: SubscriptionStatus | undefined,
  requiresPremium: boolean
): boolean {
  if (!requiresPremium) {
    return true
  }

  return (
    tier === SubscriptionTier.PREMIUM &&
    status === SubscriptionStatus.ACTIVE
  )
}

export function isPremiumActive(
  tier: SubscriptionTier | undefined,
  status: SubscriptionStatus | undefined
): boolean {
  return (
    tier === SubscriptionTier.PREMIUM &&
    status === SubscriptionStatus.ACTIVE
  )
}
