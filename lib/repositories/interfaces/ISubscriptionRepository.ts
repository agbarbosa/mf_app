import { Subscription, SubscriptionTier, SubscriptionStatus } from '@prisma/client'

export interface UpdateSubscriptionData {
  tier?: SubscriptionTier
  status?: SubscriptionStatus
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  stripeCurrentPeriodEnd?: Date
}

export interface ISubscriptionRepository {
  /**
   * Find subscription by user ID
   */
  findByUserId(userId: string): Promise<Subscription | null>

  /**
   * Find subscription by Stripe subscription ID
   */
  findByStripeSubscriptionId(subscriptionId: string): Promise<Subscription | null>

  /**
   * Update subscription
   */
  update(userId: string, data: UpdateSubscriptionData): Promise<Subscription>

  /**
   * Update subscription by Stripe subscription ID
   */
  updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    data: UpdateSubscriptionData
  ): Promise<Subscription>

  /**
   * Cancel subscription
   */
  cancel(userId: string): Promise<Subscription>
}
