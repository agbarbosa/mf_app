import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import {
  IPermissionStrategy,
  ResourceRequirements,
} from '../interfaces/IPermissionStrategy'

/**
 * Tier-based access strategy
 * Provides flexible tier-based access control with custom rules
 */
export class TierBasedStrategy implements IPermissionStrategy {
  getName(): string {
    return 'tier-based'
  }

  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    requirements?: ResourceRequirements
  ): boolean {
    // If custom check provided, use it
    if (requirements?.customCheck) {
      return requirements.customCheck(userTier, userStatus)
    }

    // If specific tier required, check exact match
    if (requirements?.requiredTier) {
      return (
        userTier === requirements.requiredTier &&
        userStatus === SubscriptionStatus.ACTIVE
      )
    }

    // If premium required, check for premium
    if (requirements?.requiresPremium) {
      return (
        userTier === SubscriptionTier.PREMIUM &&
        userStatus === SubscriptionStatus.ACTIVE
      )
    }

    // No requirements - allow access
    return true
  }
}
