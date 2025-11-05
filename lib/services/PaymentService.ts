import Stripe from 'stripe'
import {
  IPaymentService,
  CheckoutSessionResult,
  PortalSessionResult,
} from './interfaces/IPaymentService'

/**
 * PaymentService handles all payment-related operations using Stripe.
 * Implements Single Responsibility by focusing solely on payment processing.
 * Follows Dependency Inversion by depending on the Stripe abstraction.
 */
export class PaymentService implements IPaymentService {
  constructor(private stripe: Stripe) {}

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    priceId: string
  ): Promise<CheckoutSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?canceled=true`,
      metadata: {
        userId,
      },
    })

    return {
      url: session.url!,
      sessionId: session.id,
    }
  }

  /**
   * Create Stripe billing portal session
   */
  async createPortalSession(customerId: string): Promise<PortalSessionResult> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return {
      url: session.url,
    }
  }

  /**
   * Retrieve checkout session by ID
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.retrieve(sessionId)
  }
}

// Singleton instance - initialize with Stripe client
import { stripe } from '@/lib/stripe'
export const paymentService = new PaymentService(stripe)
