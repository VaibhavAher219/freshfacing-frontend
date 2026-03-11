'use client'

import { useState } from 'react'
import '@/templates/dental-classic/styles.css'

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const resolvedParams = await params
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: resolvedParams.slug,
          plan,
          email,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.success) {
        // Demo mode — no Stripe, redirect to success
        window.location.href = `/checkout/${resolvedParams.slug}/success`
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <a href="/" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            fresh<span style={{ color: 'var(--sage)' }}>facing</span>
          </a>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
            Keep Your New Website
          </h1>
          <p style={{ color: 'var(--mid)', marginBottom: 32, fontSize: '0.95rem' }}>
            Your site is ready to go live. Pick a plan and you&apos;ll get instant access to manage it.
          </p>

          {/* Plan Selection */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => setPlan('monthly')}
              style={{
                flex: 1,
                padding: '20px 16px',
                borderRadius: 12,
                border: `2px solid ${plan === 'monthly' ? 'var(--sage)' : 'var(--border)'}`,
                background: plan === 'monthly' ? 'rgba(92,122,92,0.05)' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Monthly</div>
              <div style={{ color: 'var(--sage)', fontWeight: 800, fontSize: '1.5rem', margin: '4px 0' }}>
                $20<span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Cancel anytime</div>
            </button>

            <button
              onClick={() => setPlan('annual')}
              style={{
                flex: 1,
                padding: '20px 16px',
                borderRadius: 12,
                border: `2px solid ${plan === 'annual' ? 'var(--sage)' : 'var(--border)'}`,
                background: plan === 'annual' ? 'rgba(92,122,92,0.05)' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute',
                top: -10,
                right: 12,
                background: 'var(--amber)',
                color: 'var(--ink)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                SAVE $41
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Annual</div>
              <div style={{ color: 'var(--sage)', fontWeight: 800, fontSize: '1.5rem', margin: '4px 0' }}>
                $199<span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/yr</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Best value</div>
            </button>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joe@joesdentistry.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--mid)', marginTop: 4 }}>
              Your login credentials will be sent here
            </p>
          </div>

          {/* What You Get */}
          <div style={{ marginBottom: 24, padding: 16, background: 'var(--light)', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>What&apos;s included:</div>
            {[
              'Your custom-built website',
              'Simple admin panel to edit content',
              'Mobile-optimized & fast-loading',
              'SSL security certificate',
              'Custom domain support',
              'Ongoing hosting & maintenance',
            ].map((item, i) => (
              <div key={i} style={{ fontSize: '0.85rem', padding: '3px 0', color: 'var(--ink)' }}>
                &#10003; {item}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading || !email}
            className="tmpl-btn-primary"
            style={{
              width: '100%',
              fontSize: '1.05rem',
              opacity: loading || !email ? 0.6 : 1,
            }}
          >
            {loading ? 'Redirecting to checkout...' : `Get Started — ${plan === 'monthly' ? '$20/mo' : '$199/yr'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
