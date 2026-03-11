import React from 'react'
import type { SiteContentData } from '@/lib/types'

export function HeroSection({ content }: { content: SiteContentData }) {
  return (
    <section className="tmpl-hero">
      <div className="tmpl-hero-content">
        <h1>{content.hero?.headline || 'Welcome to Our Practice'}</h1>
        <p>{content.hero?.subtext || 'Providing exceptional care for you and your family.'}</p>
        <div className="tmpl-hero-actions">
          <a href={content.hero?.ctaLink || '#contact'} className="tmpl-btn-primary">
            {content.hero?.ctaText || 'Book an Appointment'}
          </a>
          {content.businessInfo?.phone && (
            <a href={`tel:${content.businessInfo.phone}`} className="tmpl-btn-secondary">
              Call {content.businessInfo.phone}
            </a>
          )}
        </div>
      </div>
      {content.images?.heroImage && (
        <div className="tmpl-hero-image">
          <img
            src={typeof content.images.heroImage === 'object' ? content.images.heroImage.url || '' : ''}
            alt={content.businessInfo?.businessName || 'Hero image'}
          />
        </div>
      )}
    </section>
  )
}
