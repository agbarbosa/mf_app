import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import {
  WebhookRouter,
  CheckoutCompletedHandler,
  InvoicePaymentSucceededHandler,
  SubscriptionDeletedHandler,
} from '@/lib/webhooks'
import { subscriptionRepository } from '@/lib/repositories'

// Initialize webhook router with handlers (Phase 4: Strategy Pattern)
const router = new WebhookRouter()
router.register(new CheckoutCompletedHandler(subscriptionRepository))
router.register(new InvoicePaymentSucceededHandler(subscriptionRepository))
router.register(new SubscriptionDeletedHandler(subscriptionRepository))

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }

  // Route event to appropriate handler (Phase 4: Strategy Pattern)
  await router.route(event)

  return NextResponse.json({ received: true })
}
