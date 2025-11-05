import { PaymentService } from '../PaymentService'
import Stripe from 'stripe'

describe('PaymentService', () => {
  let paymentService: PaymentService
  let mockStripe: jest.Mocked<Stripe>

  beforeEach(() => {
    // Create mock Stripe instance
    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
    } as any

    paymentService = new PaymentService(mockStripe)

    // Setup environment variables
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    const userId = 'user-123'
    const email = 'test@example.com'
    const priceId = 'price_abc123'

    it('should create checkout session with correct parameters', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        customer_email: email,
        client_reference_id: userId,
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      const result = await paymentService.createCheckoutSession(
        userId,
        email,
        priceId
      )

      expect(result).toEqual({
        url: mockSession.url,
        sessionId: mockSession.id,
      })
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
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
        success_url: 'https://example.com/dashboard?success=true',
        cancel_url: 'https://example.com/subscribe?canceled=true',
        metadata: {
          userId,
        },
      })
    })

    it('should handle null url from Stripe', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: null,
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      const result = await paymentService.createCheckoutSession(
        userId,
        email,
        priceId
      )

      expect(result.url).toBeNull()
      expect(result.sessionId).toBe(mockSession.id)
    })

    it('should include userId in metadata', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      await paymentService.createCheckoutSession(userId, email, priceId)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            userId,
          },
        })
      )
    })

    it('should use correct success and cancel URLs', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      await paymentService.createCheckoutSession(userId, email, priceId)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://example.com/dashboard?success=true',
          cancel_url: 'https://example.com/subscribe?canceled=true',
        })
      )
    })

    it('should set mode to subscription', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      await paymentService.createCheckoutSession(userId, email, priceId)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
        })
      )
    })

    it('should set payment method types to card', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      await paymentService.createCheckoutSession(userId, email, priceId)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
        })
      )
    })

    it('should propagate Stripe errors', async () => {
      const error = new Error('Stripe API error')
      mockStripe.checkout.sessions.create.mockRejectedValue(error)

      await expect(
        paymentService.createCheckoutSession(userId, email, priceId)
      ).rejects.toThrow('Stripe API error')
    })

    it('should handle different price IDs', async () => {
      const differentPriceId = 'price_xyz789'
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      await paymentService.createCheckoutSession(userId, email, differentPriceId)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price: differentPriceId,
              quantity: 1,
            },
          ],
        })
      )
    })

    it('should handle special characters in email', async () => {
      const specialEmail = 'test+tag@example.com'
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any)

      await paymentService.createCheckoutSession(userId, specialEmail, priceId)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: specialEmail,
        })
      )
    })
  })

  describe('createPortalSession', () => {
    const customerId = 'cus_abc123'

    it('should create portal session with correct parameters', async () => {
      const mockSession = {
        id: 'ps_test_123',
        url: 'https://billing.stripe.com/session/ps_test_123',
      }

      mockStripe.billingPortal.sessions.create.mockResolvedValue(
        mockSession as any
      )

      const result = await paymentService.createPortalSession(customerId)

      expect(result).toEqual({
        url: mockSession.url,
      })
      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: customerId,
        return_url: 'https://example.com/dashboard',
      })
    })

    it('should use correct return URL', async () => {
      const mockSession = {
        id: 'ps_test_123',
        url: 'https://billing.stripe.com/session/ps_test_123',
      }

      mockStripe.billingPortal.sessions.create.mockResolvedValue(
        mockSession as any
      )

      await paymentService.createPortalSession(customerId)

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          return_url: 'https://example.com/dashboard',
        })
      )
    })

    it('should propagate Stripe errors', async () => {
      const error = new Error('Stripe API error')
      mockStripe.billingPortal.sessions.create.mockRejectedValue(error)

      await expect(
        paymentService.createPortalSession(customerId)
      ).rejects.toThrow('Stripe API error')
    })

    it('should handle different customer IDs', async () => {
      const differentCustomerId = 'cus_xyz789'
      const mockSession = {
        id: 'ps_test_123',
        url: 'https://billing.stripe.com/session/ps_test_123',
      }

      mockStripe.billingPortal.sessions.create.mockResolvedValue(
        mockSession as any
      )

      await paymentService.createPortalSession(differentCustomerId)

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: differentCustomerId,
        })
      )
    })
  })

  describe('getCheckoutSession', () => {
    const sessionId = 'cs_test_123'

    it('should retrieve checkout session by ID', async () => {
      const mockSession = {
        id: sessionId,
        customer: 'cus_abc123',
        payment_status: 'paid',
        subscription: 'sub_xyz789',
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)

      const result = await paymentService.getCheckoutSession(sessionId)

      expect(result).toEqual(mockSession)
      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(sessionId)
    })

    it('should propagate Stripe errors', async () => {
      const error = new Error('Session not found')
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(error)

      await expect(
        paymentService.getCheckoutSession(sessionId)
      ).rejects.toThrow('Session not found')
    })

    it('should handle different session IDs', async () => {
      const differentSessionId = 'cs_different_456'
      const mockSession = {
        id: differentSessionId,
        customer: 'cus_abc123',
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)

      await paymentService.getCheckoutSession(differentSessionId)

      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        differentSessionId
      )
    })

    it('should return full session object with all properties', async () => {
      const fullMockSession = {
        id: sessionId,
        object: 'checkout.session',
        customer: 'cus_abc123',
        customer_email: 'test@example.com',
        payment_status: 'paid',
        subscription: 'sub_xyz789',
        amount_total: 2000,
        currency: 'usd',
        mode: 'subscription',
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(
        fullMockSession as any
      )

      const result = await paymentService.getCheckoutSession(sessionId)

      expect(result).toEqual(fullMockSession)
      expect(result).toHaveProperty('customer')
      expect(result).toHaveProperty('payment_status')
      expect(result).toHaveProperty('subscription')
    })
  })
})
