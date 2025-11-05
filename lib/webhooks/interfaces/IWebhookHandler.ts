import Stripe from 'stripe'

/**
 * Interface for webhook event handlers
 * Follows Strategy Pattern for handling different Stripe webhook events
 */
export interface IWebhookHandler {
  /**
   * Handle the webhook event
   * @param event - Stripe webhook event
   */
  handle(event: Stripe.Event): Promise<void>

  /**
   * Check if this handler can process the given event type
   * @param eventType - Stripe event type (e.g., 'checkout.session.completed')
   * @returns True if this handler can process the event
   */
  canHandle(eventType: string): boolean
}
