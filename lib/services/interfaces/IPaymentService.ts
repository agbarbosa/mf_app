export interface CheckoutSessionResult {
  url: string
  sessionId?: string
}

export interface PortalSessionResult {
  url: string
}

export interface IPaymentService {
  /**
   * Create Stripe checkout session for subscription
   */
  createCheckoutSession(
    userId: string,
    email: string,
    priceId: string
  ): Promise<CheckoutSessionResult>

  /**
   * Create Stripe billing portal session
   */
  createPortalSession(customerId: string): Promise<PortalSessionResult>

  /**
   * Retrieve checkout session by ID
   */
  getCheckoutSession(sessionId: string): Promise<any>
}
