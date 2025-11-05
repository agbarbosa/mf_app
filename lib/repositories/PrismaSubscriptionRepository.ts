import { prisma } from '@/lib/prisma'
import { Subscription } from '@prisma/client'
import {
  ISubscriptionRepository,
  UpdateSubscriptionData,
} from './interfaces/ISubscriptionRepository'

/**
 * Prisma implementation of ISubscriptionRepository
 * Handles all subscription data access operations using Prisma ORM
 */
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  /**
   * Find subscription by user ID
   * @param userId - User ID
   * @returns Subscription or null if not found
   */
  async findByUserId(userId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { userId },
    })
  }

  /**
   * Find subscription by Stripe subscription ID
   * @param subscriptionId - Stripe subscription ID
   * @returns Subscription or null if not found
   */
  async findByStripeSubscriptionId(
    subscriptionId: string
  ): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    })
  }

  /**
   * Update subscription by user ID
   * @param userId - User ID
   * @param data - Update data
   * @returns Updated subscription
   */
  async update(
    userId: string,
    data: UpdateSubscriptionData
  ): Promise<Subscription> {
    return prisma.subscription.update({
      where: { userId },
      data,
    })
  }

  /**
   * Update subscription by Stripe subscription ID
   * @param stripeSubscriptionId - Stripe subscription ID
   * @param data - Update data
   * @returns Updated subscription
   */
  async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    data: UpdateSubscriptionData
  ): Promise<Subscription> {
    return prisma.subscription.update({
      where: { stripeSubscriptionId },
      data,
    })
  }

  /**
   * Cancel subscription (downgrade to FREE)
   * @param userId - User ID
   * @returns Updated subscription
   */
  async cancel(userId: string): Promise<Subscription> {
    return prisma.subscription.update({
      where: { userId },
      data: {
        tier: 'FREE',
        status: 'CANCELED',
      },
    })
  }
}

// Export singleton instance
export const subscriptionRepository = new PrismaSubscriptionRepository()
