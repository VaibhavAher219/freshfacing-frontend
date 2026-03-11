import Link from 'next/link'

// Marketing homepage — placeholder that links to the key demo routes.
// The full marketing site from _static_backup can be ported later.
export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream, #faf7f2)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          fresh<span style={{ color: '#5c7a5c' }}>facing</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: '0.9rem' }}>
          <Link href="#how" style={{ color: '#7a6e60' }}>How It Works</Link>
          <Link href="#pricing" style={{ color: '#7a6e60' }}>Pricing</Link>
          <Link href="/admin" style={{
            background: '#5c7a5c',
            color: 'white',
            padding: '8px 20px',
            borderRadius: 6,
            fontWeight: 600,
          }}>Admin Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '80px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 64,
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Time for a<br />fresh <span style={{ color: '#5c7a5c' }}>facing</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#7a6e60', lineHeight: 1.6, marginBottom: 32 }}>
            We build modern, fast websites for local businesses. Your new site is ready in under an hour — starting at $20/month.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/preview/demo-dentist" style={{
              background: '#e8a830',
              color: '#1c1810',
              padding: '14px 32px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '1rem',
            }}>
              See a Demo Site
            </Link>
            <Link href="/client-admin" style={{
              background: 'transparent',
              color: '#5c7a5c',
              padding: '14px 32px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '1rem',
              border: '2px solid #5c7a5c',
            }}>
              Try the Admin Panel
            </Link>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7a6e60', marginBottom: 12 }}>
            DEMO WALKTHROUGH
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { num: '1', label: 'Preview Site', href: '/preview/demo-dentist', desc: 'See the dentist demo site with purchase banner' },
              { num: '2', label: 'Checkout Flow', href: '/checkout/demo-dentist', desc: 'Experience the subscription purchase page' },
              { num: '3', label: 'Client Admin', href: '/client-admin', desc: 'Edit the site with the simple admin panel' },
              { num: '4', label: 'Payload Admin', href: '/admin', desc: 'Internal CMS for the FreshFacing team' },
            ].map((item) => (
              <Link key={item.num} href={item.href} style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                padding: 16,
                borderRadius: 8,
                border: '1px solid rgba(28,24,16,0.08)',
                transition: 'background 0.15s',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#5c7a5c',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                }}>
                  {item.num}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#7a6e60' }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{
        background: '#2e2416',
        color: '#faf7f2',
        padding: '80px 40px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>Simple Pricing</h2>
          <p style={{ color: 'rgba(250,247,242,0.6)', marginBottom: 48 }}>
            Everything included. No hidden fees. Cancel anytime.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '40px 32px',
              width: 280,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Monthly</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>$20<span style={{ fontSize: '1rem', fontWeight: 400 }}>/mo</span></div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(250,247,242,0.5)', marginTop: 8 }}>$240/year</div>
            </div>
            <div style={{
              background: 'rgba(232,168,48,0.1)',
              border: '2px solid #e8a830',
              borderRadius: 16,
              padding: '40px 32px',
              width: 280,
              position: 'relative' as const,
            }}>
              <div style={{
                position: 'absolute' as const,
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#e8a830',
                color: '#1c1810',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                SAVE $41
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Annual</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>$199<span style={{ fontSize: '1rem', fontWeight: 400 }}>/yr</span></div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(250,247,242,0.5)', marginTop: 8 }}>~$16.58/mo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 40px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#7a6e60',
      }}>
        &copy; {new Date().getFullYear()} FreshFacing. All rights reserved.
      </footer>
    </div>
  )
}
