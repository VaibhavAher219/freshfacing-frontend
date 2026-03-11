import React from 'react'
import type { SiteContentData } from '@/lib/types'

export function GallerySection({ content }: { content: SiteContentData }) {
  const gallery = content.images?.gallery || []
  if (gallery.length === 0) return null

  return (
    <section id="gallery" className="tmpl-gallery">
      <div className="tmpl-container">
        <h2 className="tmpl-section-title">Our Practice</h2>
        <div className="tmpl-gallery-grid">
          {gallery.map((item, i) => (
            <div key={i} className="tmpl-gallery-item">
              <img
                src={typeof item.image === 'object' ? item.image?.url || '' : ''}
                alt={item.caption || `Gallery photo ${i + 1}`}
              />
              {item.caption && <p className="tmpl-gallery-caption">{item.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
