import React from 'react'
import type { SiteContentData } from '@/lib/types'

export function HoursSection({ content }: { content: SiteContentData }) {
  const hours = content.hours || []
  if (hours.length === 0) return null

  return (
    <section id="hours" className="tmpl-hours">
      <div className="tmpl-container">
        <h2 className="tmpl-section-title">Office Hours</h2>
        <div className="tmpl-hours-table">
          {hours.map((h, i) => (
            <div key={i} className={`tmpl-hours-row ${h.closed ? 'closed' : ''}`}>
              <span className="tmpl-hours-day">{h.day}</span>
              <span className="tmpl-hours-time">
                {h.closed ? 'Closed' : `${h.open} — ${h.close}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
