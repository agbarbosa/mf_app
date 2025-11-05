import Stripe from 'stripe'
import { IWebhookHandler } from '../interfaces/IWebhookHandler'
import { ISubscriptionRepository } from '@/lib/repositories/interfaces/ISubscriptionRepository'
import { stripe } from '@/lib/stripe'

/**
 * Handles checkout.session.completed webhook events
 * Updates subscription to PREMIUM when checkout is completed
 */
export class CheckoutCompletedHandler implements IWebhookHandler {
  constructor(private subscriptionRepo: ISubscriptionRepository) {}

  canHandle(eventType: string): boolean {
    return eventType === 'checkout.session.completed'
  }

  async handle(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session

    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    // Update subscription to PREMIUM using repository
    await this.subscriptionRepo.update(session?.metadata?.userId!, {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ),
      tier: 'PREMIUM',
      status: 'ACTIVE',
    })
  }
}
