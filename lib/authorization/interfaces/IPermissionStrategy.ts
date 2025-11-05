import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

/**
 * Requirements for accessing a resource
 */
export interface ResourceRequirements {
  /** Whether the resource requires premium subscription */
  requiresPremium?: boolean

  /** Specific tier required to access the resource */
  requiredTier?: SubscriptionTier

  /** Custom validation function for complex access rules */
  customCheck?: (tier?: SubscriptionTier, status?: SubscriptionStatus) => boolean
}

/**
 * Interface for permission strategies
 * Follows Strategy Pattern for flexible access control
 */
export interface IPermissionStrategy {
  /**
   * Check if user has access to resource
   * @param userTier - User's subscription tier
   * @param userStatus - User's subscription status
   * @param requirements - Resource access requirements
   * @returns True if user has access
   */
  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    requirements?: ResourceRequirements
  ): boolean

  /**
   * Get strategy name for identification
   * @returns Strategy name
   */
  getName(): string
}
