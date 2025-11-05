import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import {
  IPermissionStrategy,
  ResourceRequirements,
} from './interfaces/IPermissionStrategy'
import { PremiumAccessStrategy } from './strategies/PremiumAccessStrategy'

/**
 * Authorization service
 * Manages permission strategies and provides centralized access control
 *
 * Benefits:
 * - Single Responsibility: Only handles authorization logic
 * - Open/Closed: Can add new strategies without modifying service
 * - Strategy Pattern: Delegates permission checks to strategies
 */
export class AuthorizationService {
  private strategies: Map<string, IPermissionStrategy> = new Map()
  private defaultStrategy: IPermissionStrategy

  constructor(defaultStrategy?: IPermissionStrategy) {
    this.defaultStrategy = defaultStrategy || new PremiumAccessStrategy()
    this.registerStrategy(this.defaultStrategy)
  }

  /**
   * Register a permission strategy
   * @param strategy - Strategy to register
   */
  registerStrategy(strategy: IPermissionStrategy): void {
    this.strategies.set(strategy.getName(), strategy)
  }

  /**
   * Unregister a permission strategy
   * @param strategyName - Name of strategy to unregister
   */
  unregisterStrategy(strategyName: string): void {
    if (strategyName !== this.defaultStrategy.getName()) {
      this.strategies.delete(strategyName)
    }
  }

  /**
   * Check if user has access to resource
   * @param userTier - User's subscription tier
   * @param userStatus - User's subscription status
   * @param requirements - Resource access requirements
   * @param strategyName - Optional strategy name (uses default if not provided)
   * @returns True if user has access
   */
  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    requirements?: ResourceRequirements,
    strategyName?: string
  ): boolean {
    const strategy = strategyName
      ? this.strategies.get(strategyName)
      : this.defaultStrategy

    if (!strategy) {
      console.warn(`Strategy not found: ${strategyName}, using default`)
      return this.defaultStrategy.canAccess(userTier, userStatus, requirements)
    }

    return strategy.canAccess(userTier, userStatus, requirements)
  }

  /**
   * Get all registered strategy names
   * @returns Array of strategy names
   */
  getRegisteredStrategies(): string[] {
    return Array.from(this.strategies.keys())
  }
}

// Export singleton instance with default strategy
export const authorizationService = new AuthorizationService()
