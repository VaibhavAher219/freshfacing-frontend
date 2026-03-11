import React from 'react'
import { HeroSection } from './HeroSection'
import { ServicesSection } from './ServicesSection'
import { AboutSection } from './AboutSection'
import { HoursSection } from './HoursSection'
import { ContactSection } from './ContactSection'
import { GallerySection } from './GallerySection'
import { FooterSection } from './FooterSection'
import type { SiteContentData } from '@/lib/types'

interface DentalTemplateProps {
  content: SiteContentData
  isPreview?: boolean
  slug?: string
}

export function DentalTemplate({ content, isPreview, slug }: DentalTemplateProps) {
  const primaryColor = content.theme?.primaryColor || '#5c7a5c'
  const accentColor = content.theme?.accentColor || '#e8a830'

  return (
    <div
      style={{
        '--primary': primaryColor,
        '--accent': accentColor,
      } as React.CSSProperties}
    >
      {isPreview && (
        <div className="preview-banner">
          <div className="preview-banner-inner">
            <span>This is a preview of your new website. Like what you see?</span>
            <a href={`/checkout/${slug}`} className="preview-cta">
              Keep This Site — $20/mo
            </a>
          </div>
        </div>
      )}

      <nav className="site-nav">
        <div className="site-nav-inner">
          <a href="#" className="site-logo">
            {content.businessInfo?.businessName || 'Business Name'}
          </a>
          <div className="site-nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#hours">Hours</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact" className="nav-cta">
              {content.hero?.ctaText || 'Contact Us'}
            </a>
          </div>
        </div>
      </nav>

      <HeroSection content={content} />
      <ServicesSection content={content} />
      <AboutSection content={content} />
      <HoursSection content={content} />
      <GallerySection content={content} />
      <ContactSection content={content} />
      <FooterSection content={content} />
    </div>
  )
}
