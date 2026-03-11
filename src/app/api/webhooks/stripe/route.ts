import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import crypto from 'crypto'

// In production, this handles Stripe webhook events.
// The checkout flow creates the user and activates the tenant.
// This webhook handles ongoing subscription events.

export async function POST(request: NextRequest) {
  const stripe = process.env.STRIPE_SECRET_KEY
    ? new (require('stripe').default)(process.env.STRIPE_SECRET_KEY)
    : null

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const { tenantId, tenantSlug, plan } = session.metadata || {}

      if (!tenantId) break

      // Generate temp password
      const tempPassword = crypto.randomBytes(6).toString('hex')

      // Activate tenant
      await payload.update({
        collection: 'tenants',
        id: tenantId,
        data: {
          status: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          subscriptionPlan: plan || 'monthly',
          subscriptionStatus: 'active',
        },
      })

      // Create client user
      await payload.create({
        collection: 'users',
        data: {
          email: session.customer_email,
          password: tempPassword,
          role: 'client',
          tenant: tenantId,
        },
      })

      // TODO: Send welcome email with credentials via Resend
      console.log(`New client: ${session.customer_email} / ${tempPassword}`)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer

      // Find tenant by Stripe customer ID
      const tenants = await payload.find({
        collection: 'tenants',
        where: { stripeCustomerId: { equals: customerId } },
        limit: 1,
      })

      if (tenants.docs[0]) {
        await payload.update({
          collection: 'tenants',
          id: tenants.docs[0].id,
          data: { subscriptionStatus: 'past_due' },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer

      const tenants = await payload.find({
        collection: 'tenants',
        where: { stripeCustomerId: { equals: customerId } },
        limit: 1,
      })

      if (tenants.docs[0]) {
        await payload.update({
          collection: 'tenants',
          id: tenants.docs[0].id,
          data: {
            status: 'churned',
            subscriptionStatus: 'canceled',
          },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
