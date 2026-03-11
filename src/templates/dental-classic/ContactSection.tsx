'use client'

import React from 'react'
import type { SiteContentData } from '@/lib/types'

export function ContactSection({ content }: { content: SiteContentData }) {
  const info = content.businessInfo

  return (
    <section id="contact" className="tmpl-contact">
      <div className="tmpl-container">
        <h2 className="tmpl-section-title">Get In Touch</h2>
        <div className="tmpl-contact-grid">
          <div className="tmpl-contact-info">
            {info?.phone && (
              <div className="tmpl-contact-item">
                <span className="tmpl-contact-label">Phone</span>
                <a href={`tel:${info.phone}`}>{info.phone}</a>
              </div>
            )}
            {info?.email && (
              <div className="tmpl-contact-item">
                <span className="tmpl-contact-label">Email</span>
                <a href={`mailto:${info.email}`}>{info.email}</a>
              </div>
            )}
            {info?.address && (
              <div className="tmpl-contact-item">
                <span className="tmpl-contact-label">Address</span>
                <p>{info.address}</p>
              </div>
            )}
            <div className="tmpl-contact-social">
              {content.socialLinks?.facebook && (
                <a href={content.socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              )}
              {content.socialLinks?.instagram && (
                <a href={content.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              )}
              {content.socialLinks?.yelp && (
                <a href={content.socialLinks.yelp} target="_blank" rel="noopener noreferrer">Yelp</a>
              )}
              {content.socialLinks?.google && (
                <a href={content.socialLinks.google} target="_blank" rel="noopener noreferrer">Google</a>
              )}
            </div>
          </div>
          <div className="tmpl-contact-form">
            <h3>Send Us a Message</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" className="tmpl-input" />
              <input type="email" placeholder="Your Email" className="tmpl-input" />
              <input type="tel" placeholder="Your Phone" className="tmpl-input" />
              <textarea placeholder="Your Message" rows={4} className="tmpl-input tmpl-textarea" />
              <button type="submit" className="tmpl-btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
