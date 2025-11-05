import Stripe from 'stripe'
import { IWebhookHandler } from '../interfaces/IWebhookHandler'
import { ISubscriptionRepository } from '@/lib/repositories/interfaces/ISubscriptionRepository'
import { stripe } from '@/lib/stripe'

/**
 * Handles invoice.payment_succeeded webhook events
 * Renews subscription and updates billing period
 */
export class InvoicePaymentSucceededHandler implements IWebhookHandler {
  constructor(private subscriptionRepo: ISubscriptionRepository) {}

  canHandle(eventType: string): boolean {
    return eventType === 'invoice.payment_succeeded'
  }

  async handle(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice

    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )

    // Update subscription billing period using repository
    await this.subscriptionRepo.updateByStripeSubscriptionId(subscription.id, {
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ),
      status: 'ACTIVE',
    })
  }
}
