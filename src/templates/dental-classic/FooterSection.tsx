import React from 'react'
import type { SiteContentData } from '@/lib/types'

export function FooterSection({ content }: { content: SiteContentData }) {
  const info = content.businessInfo
  const year = new Date().getFullYear()

  return (
    <footer className="tmpl-footer">
      <div className="tmpl-container">
        <div className="tmpl-footer-grid">
          <div className="tmpl-footer-brand">
            <h3>{info?.businessName || 'Business Name'}</h3>
            {info?.tagline && <p>{info.tagline}</p>}
          </div>
          <div className="tmpl-footer-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#hours">Hours</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="tmpl-footer-contact">
            {info?.phone && <p>{info.phone}</p>}
            {info?.email && <p>{info.email}</p>}
            {info?.address && <p>{info.address}</p>}
          </div>
        </div>
        <div className="tmpl-footer-bottom">
          <p>&copy; {year} {info?.businessName || 'Business Name'}. All rights reserved.</p>
          <p className="tmpl-powered-by">
            Powered by <a href="https://freshfacing.com" target="_blank" rel="noopener noreferrer">FreshFacing</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
