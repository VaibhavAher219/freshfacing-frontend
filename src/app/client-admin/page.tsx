'use client'

import { useState, useEffect } from 'react'
import './admin.css'

interface SiteData {
  id: string
  tenant: any
  businessInfo: {
    businessName: string
    tagline: string
    phone: string
    email: string
    address: string
  }
  hours: Array<{ day: string; open: string; close: string; closed: boolean }>
  services: Array<{ name: string; description: string }>
  hero: { headline: string; subtext: string; ctaText: string; ctaLink: string }
  socialLinks: { facebook: string; instagram: string; yelp: string; google: string }
  theme: { primaryColor: string; accentColor: string }
}

const DEFAULT_HOURS = [
  { day: 'Monday', open: '9:00 AM', close: '5:00 PM', closed: false },
  { day: 'Tuesday', open: '9:00 AM', close: '5:00 PM', closed: false },
  { day: 'Wednesday', open: '9:00 AM', close: '5:00 PM', closed: false },
  { day: 'Thursday', open: '9:00 AM', close: '5:00 PM', closed: false },
  { day: 'Friday', open: '9:00 AM', close: '5:00 PM', closed: false },
  { day: 'Saturday', open: '10:00 AM', close: '2:00 PM', closed: false },
  { day: 'Sunday', open: '', close: '', closed: true },
]

export default function ClientAdminPage() {
  const [activeTab, setActiveTab] = useState('info')
  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Check auth status
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/users/me', { credentials: 'include' })
      const result = await res.json()
      if (result.user) {
        setUser(result.user)
        loadSiteContent(result.user.tenant)
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const result = await res.json()
      if (result.user) {
        setUser(result.user)
        loadSiteContent(result.user.tenant)
      } else {
        setLoginError('Invalid email or password')
      }
    } catch {
      setLoginError('Login failed. Please try again.')
    }
  }

  async function loadSiteContent(tenantId: string | number | { id: string }) {
    try {
      const tid = typeof tenantId === 'object' ? tenantId.id : tenantId
      const res = await fetch(`/api/site-content?where[tenant][equals]=${tid}&depth=2`)
      const result = await res.json()
      if (result.docs?.[0]) {
        setData(result.docs[0])
      }
    } catch (err) {
      setError('Failed to load site content')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!data) return
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`/api/site-content/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessInfo: data.businessInfo,
          hours: data.hours,
          services: data.services,
          hero: data.hero,
          socialLinks: data.socialLinks,
          theme: data.theme,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  function updateField(section: string, field: string, value: any) {
    if (!data) return
    setData({
      ...data,
      [section]: { ...(data as any)[section], [field]: value },
    })
  }

  // Login screen
  if (!user) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="admin-logo">fresh<span>facing</span></div>
          <h1>Log in to your site</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="admin-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="admin-input"
              required
            />
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit" className="admin-btn-primary">Log In</button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-logo">fresh<span>facing</span></div>
        <p>Loading your site...</p>
      </div>
    )
  }

  const tenantSlug = typeof data?.tenant === 'object' ? data.tenant.slug : ''

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">fresh<span>facing</span></div>

        <nav className="admin-nav">
          {[
            { id: 'info', label: 'Business Info' },
            { id: 'hours', label: 'Hours' },
            { id: 'services', label: 'Services' },
            { id: 'hero', label: 'Hero Section' },
            { id: 'social', label: 'Social Links' },
            { id: 'theme', label: 'Colors' },
            { id: 'upsells', label: 'Add-On Services' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {tenantSlug && (
          <a
            href={`/${tenantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-view-site"
          >
            View My Site &#8599;
          </a>
        )}
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>{activeTab === 'upsells' ? 'Grow Your Business' : activeTab === 'settings' ? 'Settings' : 'Edit Your Site'}</h1>
          {!['upsells', 'settings'].includes(activeTab) && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn-primary"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          )}
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <div className="admin-content">
          {/* Business Info Tab */}
          {activeTab === 'info' && data && (
            <div className="admin-section">
              <div className="admin-field">
                <label>Business Name</label>
                <input
                  type="text"
                  value={data.businessInfo?.businessName || ''}
                  onChange={(e) => updateField('businessInfo', 'businessName', e.target.value)}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label>Tagline / Slogan</label>
                <input
                  type="text"
                  value={data.businessInfo?.tagline || ''}
                  onChange={(e) => updateField('businessInfo', 'tagline', e.target.value)}
                  placeholder="e.g., Your smile is our passion"
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={data.businessInfo?.phone || ''}
                  onChange={(e) => updateField('businessInfo', 'phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={data.businessInfo?.email || ''}
                  onChange={(e) => updateField('businessInfo', 'email', e.target.value)}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label>Street Address</label>
                <textarea
                  value={data.businessInfo?.address || ''}
                  onChange={(e) => updateField('businessInfo', 'address', e.target.value)}
                  rows={2}
                  className="admin-input admin-textarea"
                />
              </div>
            </div>
          )}

          {/* Hours Tab */}
          {activeTab === 'hours' && data && (
            <div className="admin-section">
              <div className="admin-hours-table">
                {(data.hours?.length ? data.hours : DEFAULT_HOURS).map((h, i) => (
                  <div key={i} className="admin-hours-row">
                    <span className="admin-hours-day">{h.day}</span>
                    <label className="admin-hours-closed">
                      <input
                        type="checkbox"
                        checked={h.closed || false}
                        onChange={(e) => {
                          const hours = [...(data.hours || DEFAULT_HOURS)]
                          hours[i] = { ...hours[i], closed: e.target.checked }
                          setData({ ...data, hours })
                        }}
                      />
                      Closed
                    </label>
                    {!h.closed && (
                      <>
                        <input
                          type="text"
                          value={h.open || ''}
                          onChange={(e) => {
                            const hours = [...(data.hours || DEFAULT_HOURS)]
                            hours[i] = { ...hours[i], open: e.target.value }
                            setData({ ...data, hours })
                          }}
                          placeholder="9:00 AM"
                          className="admin-input admin-hours-input"
                        />
                        <span className="admin-hours-to">to</span>
                        <input
                          type="text"
                          value={h.close || ''}
                          onChange={(e) => {
                            const hours = [...(data.hours || DEFAULT_HOURS)]
                            hours[i] = { ...hours[i], close: e.target.value }
                            setData({ ...data, hours })
                          }}
                          placeholder="5:00 PM"
                          className="admin-input admin-hours-input"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && data && (
            <div className="admin-section">
              {(data.services || []).map((s, i) => (
                <div key={i} className="admin-service-card">
                  <div className="admin-service-header">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => {
                        const services = [...(data.services || [])]
                        services[i] = { ...services[i], name: e.target.value }
                        setData({ ...data, services })
                      }}
                      placeholder="Service name"
                      className="admin-input"
                    />
                    <button
                      onClick={() => {
                        const services = (data.services || []).filter((_, idx) => idx !== i)
                        setData({ ...data, services })
                      }}
                      className="admin-btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={s.description || ''}
                    onChange={(e) => {
                      const services = [...(data.services || [])]
                      services[i] = { ...services[i], description: e.target.value }
                      setData({ ...data, services })
                    }}
                    placeholder="Short description (optional)"
                    rows={2}
                    maxLength={200}
                    className="admin-input admin-textarea"
                  />
                </div>
              ))}
              {(data.services || []).length < 12 && (
                <button
                  onClick={() => {
                    const services = [...(data.services || []), { name: '', description: '' }]
                    setData({ ...data, services })
                  }}
                  className="admin-btn-secondary"
                >
                  + Add Service
                </button>
              )}
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && data && (
            <div className="admin-section">
              <div className="admin-field">
                <label>Main Headline</label>
                <input
                  type="text"
                  value={data.hero?.headline || ''}
                  onChange={(e) => updateField('hero', 'headline', e.target.value)}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label>Subtext</label>
                <textarea
                  value={data.hero?.subtext || ''}
                  onChange={(e) => updateField('hero', 'subtext', e.target.value)}
                  rows={3}
                  className="admin-input admin-textarea"
                />
              </div>
              <div className="admin-field">
                <label>Button Text</label>
                <input
                  type="text"
                  value={data.hero?.ctaText || ''}
                  onChange={(e) => updateField('hero', 'ctaText', e.target.value)}
                  placeholder="Book an Appointment"
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label>Button Link</label>
                <input
                  type="text"
                  value={data.hero?.ctaLink || ''}
                  onChange={(e) => updateField('hero', 'ctaLink', e.target.value)}
                  placeholder="#contact"
                  className="admin-input"
                />
              </div>
            </div>
          )}

          {/* Social Links Tab */}
          {activeTab === 'social' && data && (
            <div className="admin-section">
              {(['facebook', 'instagram', 'yelp', 'google'] as const).map((platform) => (
                <div key={platform} className="admin-field">
                  <label>{platform.charAt(0).toUpperCase() + platform.slice(1)} URL</label>
                  <input
                    type="url"
                    value={data.socialLinks?.[platform] || ''}
                    onChange={(e) => updateField('socialLinks', platform, e.target.value)}
                    placeholder={`https://${platform}.com/yourbusiness`}
                    className="admin-input"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && data && (
            <div className="admin-section">
              <div className="admin-field">
                <label>Primary Color</label>
                <div className="admin-color-picker">
                  <input
                    type="color"
                    value={data.theme?.primaryColor || '#5c7a5c'}
                    onChange={(e) => updateField('theme', 'primaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={data.theme?.primaryColor || '#5c7a5c'}
                    onChange={(e) => updateField('theme', 'primaryColor', e.target.value)}
                    className="admin-input"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div className="admin-field">
                <label>Accent Color</label>
                <div className="admin-color-picker">
                  <input
                    type="color"
                    value={data.theme?.accentColor || '#e8a830'}
                    onChange={(e) => updateField('theme', 'accentColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={data.theme?.accentColor || '#e8a830'}
                    onChange={(e) => updateField('theme', 'accentColor', e.target.value)}
                    className="admin-input"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upsells Tab */}
          {activeTab === 'upsells' && (
            <div className="admin-section">
              <p className="admin-section-desc">
                Take your online presence to the next level with our add-on services.
              </p>
              <div className="admin-upsell-grid">
                {[
                  { name: 'SEO Starter Package', price: '$99', desc: 'On-page SEO, Google Search Console setup, keyword research, and meta tag optimization.', type: 'one-time' },
                  { name: 'Google Business Profile', price: '$49', desc: 'Complete setup of your Google Business Profile for Maps and local search.', type: 'one-time' },
                  { name: 'Monthly Blog Posts', price: '$79/mo', desc: '4 professionally written blog posts per month to boost your SEO.', type: 'monthly' },
                  { name: 'Custom Logo Design', price: '$149', desc: 'Professional logo with 3 concepts and 2 rounds of revisions.', type: 'one-time' },
                  { name: 'Social Media Setup', price: '$69', desc: 'Branded Facebook, Instagram, and Google profiles.', type: 'one-time' },
                ].map((service, i) => (
                  <div key={i} className="admin-upsell-card">
                    <h3>{service.name}</h3>
                    <p className="admin-upsell-price">{service.price}</p>
                    <p>{service.desc}</p>
                    <button className="admin-btn-primary">Purchase</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="admin-section">
              <div className="admin-settings-card">
                <h3>Custom Domain</h3>
                <p>Connect your own domain name to your website.</p>
                <input
                  type="text"
                  placeholder="yourdomain.com"
                  className="admin-input"
                />
                <p className="admin-hint">
                  After saving, add a CNAME record pointing to <code>cname.vercel-dns.com</code> at your domain registrar.
                </p>
                <button className="admin-btn-secondary">Save Domain</button>
              </div>

              <div className="admin-settings-card">
                <h3>Manage Billing</h3>
                <p>Update your payment method, view invoices, or change your plan.</p>
                <button className="admin-btn-secondary">Open Billing Portal</button>
              </div>

              <div className="admin-settings-card">
                <h3>Change Password</h3>
                <input type="password" placeholder="Current password" className="admin-input" />
                <input type="password" placeholder="New password" className="admin-input" />
                <button className="admin-btn-secondary">Update Password</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
