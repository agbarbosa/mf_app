import Stripe from 'stripe'
import { IWebhookHandler } from './interfaces/IWebhookHandler'

/**
 * Webhook router that dispatches events to appropriate handlers
 * Follows Strategy Pattern - each handler is a strategy for processing specific event types
 *
 * Benefits:
 * - Open/Closed Principle: Can add new handlers without modifying router
 * - Single Responsibility: Each handler processes one event type
 * - Easy to test: Mock handlers for unit tests
 */
export class WebhookRouter {
  private handlers: IWebhookHandler[] = []

  /**
   * Register a webhook handler
   * @param handler - Webhook handler to register
   */
  register(handler: IWebhookHandler): void {
    this.handlers.push(handler)
  }

  /**
   * Route webhook event to appropriate handler
   * @param event - Stripe webhook event
   * @throws Error if no handler found for event type
   */
  async route(event: Stripe.Event): Promise<void> {
    const handler = this.handlers.find(h => h.canHandle(event.type))

    if (!handler) {
      console.warn(`No handler registered for event type: ${event.type}`)
      return
    }

    await handler.handle(event)
  }

  /**
   * Get all registered handlers
   * @returns Array of registered handlers
   */
  getHandlers(): IWebhookHandler[] {
    return [...this.handlers]
  }

  /**
   * Clear all registered handlers
   */
  clear(): void {
    this.handlers = []
  }
}
