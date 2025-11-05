import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import {
  IPermissionStrategy,
  ResourceRequirements,
} from '../interfaces/IPermissionStrategy'

/**
 * Premium access strategy
 * Grants access based on premium subscription status
 */
export class PremiumAccessStrategy implements IPermissionStrategy {
  getName(): string {
    return 'premium-access'
  }

  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    requirements?: ResourceRequirements
  ): boolean {
    // If resource doesn't require premium, allow access
    if (!requirements?.requiresPremium) {
      return true
    }

    // Check if user has active premium subscription
    return (
      userTier === SubscriptionTier.PREMIUM &&
      userStatus === SubscriptionStatus.ACTIVE
    )
  }
}
