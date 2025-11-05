import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import {
  IPermissionStrategy,
  ResourceRequirements,
} from '../interfaces/IPermissionStrategy'

/**
 * Free access strategy
 * Allows access to free resources for all users
 */
export class FreeAccessStrategy implements IPermissionStrategy {
  getName(): string {
    return 'free-access'
  }

  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    requirements?: ResourceRequirements
  ): boolean {
    // Allow access if resource doesn't require premium
    if (!requirements?.requiresPremium) {
      return true
    }

    // Deny access to premium-only resources
    return false
  }
}
