import Stripe from 'stripe'
import { IWebhookHandler } from '../interfaces/IWebhookHandler'
import { ISubscriptionRepository } from '@/lib/repositories/interfaces/ISubscriptionRepository'

/**
 * Handles customer.subscription.deleted webhook events
 * Downgrades subscription to FREE when canceled
 */
export class SubscriptionDeletedHandler implements IWebhookHandler {
  constructor(private subscriptionRepo: ISubscriptionRepository) {}

  canHandle(eventType: string): boolean {
    return eventType === 'customer.subscription.deleted'
  }

  async handle(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription

    // Downgrade to FREE tier using repository
    await this.subscriptionRepo.updateByStripeSubscriptionId(subscription.id, {
      tier: 'FREE',
      status: 'CANCELED',
    })
  }
}
