import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient, getTenantBySlug } from '@/lib/payload'
import crypto from 'crypto'

// Stripe integration — uses real Stripe when STRIPE_SECRET_KEY is set,
// falls back to demo mode for local development
const stripe = process.env.STRIPE_SECRET_KEY
  ? new (require('stripe').default)(process.env.STRIPE_SECRET_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const { slug, plan, email } = await request.json()

    if (!slug || !plan || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tenant = await getTenantBySlug(slug)
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // If Stripe is configured, create a real checkout session
    if (stripe) {
      const priceId = plan === 'annual'
        ? process.env.STRIPE_ANNUAL_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          tenantId: String(tenant.id),
          tenantSlug: slug,
          plan,
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/${slug}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/${slug}`,
      })

      return NextResponse.json({ url: session.url })
    }

    // Demo mode: simulate the purchase flow without Stripe
    const payload = await getPayloadClient()

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(6).toString('hex')

    // Update tenant to active
    await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        status: 'active',
        subscriptionPlan: plan,
        subscriptionStatus: 'active',
      },
    })

    // Create client user
    await payload.create({
      collection: 'users',
      data: {
        email,
        password: tempPassword,
        role: 'client',
        tenant: tenant.id,
      },
    })

    // Log the credentials (in production, this would be sent via email)
    console.log('\n=== DEMO: New Client Account Created ===')
    console.log(`Email: ${email}`)
    console.log(`Password: ${tempPassword}`)
    console.log(`Site: http://localhost:3000/${slug}`)
    console.log(`Admin: http://localhost:3000/client-admin`)
    console.log('=========================================\n')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
