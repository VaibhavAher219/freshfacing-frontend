import React from 'react'
import type { SiteContentData } from '@/lib/types'

const SERVICE_ICONS: Record<string, string> = {
  cleaning: '🦷',
  whitening: '✨',
  implants: '🔩',
  orthodontics: '😁',
  emergency: '🚨',
  cosmetic: '💎',
  default: '⭐',
}

export function ServicesSection({ content }: { content: SiteContentData }) {
  const services = content.services || []
  if (services.length === 0) return null

  return (
    <section id="services" className="tmpl-services">
      <div className="tmpl-container">
        <h2 className="tmpl-section-title">Our Services</h2>
        <p className="tmpl-section-subtitle">
          Comprehensive care for every member of your family
        </p>
        <div className="tmpl-services-grid">
          {services.map((service, i) => (
            <div key={i} className="tmpl-service-card">
              <div className="tmpl-service-icon">
                {SERVICE_ICONS[service.name?.toLowerCase() || ''] || SERVICE_ICONS.default}
              </div>
              <h3>{service.name}</h3>
              {service.description && <p>{service.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
