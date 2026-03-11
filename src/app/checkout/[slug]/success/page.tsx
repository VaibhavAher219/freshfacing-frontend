import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream, #faf7f2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>&#127881;</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
          Welcome to FreshFacing!
        </h1>
        <p style={{ color: '#7a6e60', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 32 }}>
          Your site is live! Check your email for your login credentials.
          You can start editing your site right away.
        </p>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          textAlign: 'left',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>What&apos;s next:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { step: '1', text: 'Check your email for login credentials' },
              { step: '2', text: 'Log into your admin panel to customize your site' },
              { step: '3', text: 'Update your business info, hours, and services' },
              { step: '4', text: 'Optionally connect your own domain name' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#5c7a5c',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <p style={{ fontSize: '0.95rem', paddingTop: 3 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/client-admin"
          style={{
            display: 'inline-block',
            background: '#5c7a5c',
            color: 'white',
            padding: '14px 40px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Go to Admin Panel
        </Link>
      </div>
    </div>
  )
}
