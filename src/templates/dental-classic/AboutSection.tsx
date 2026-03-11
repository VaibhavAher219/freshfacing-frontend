import React from 'react'
import type { SiteContentData } from '@/lib/types'

export function AboutSection({ content }: { content: SiteContentData }) {
  // Render rich text as simple paragraphs
  const aboutText = content.aboutText

  return (
    <section id="about" className="tmpl-about">
      <div className="tmpl-container">
        <div className="tmpl-about-grid">
          <div className="tmpl-about-content">
            <h2 className="tmpl-section-title">About Us</h2>
            {aboutText && typeof aboutText === 'object' && aboutText.root?.children ? (
              <div className="tmpl-about-text">
                {aboutText.root.children.map((node: any, i: number) => {
                  if (node.type === 'paragraph') {
                    const text = node.children?.map((child: any) => child.text || '').join('') || ''
                    return text ? <p key={i}>{text}</p> : null
                  }
                  return null
                })}
              </div>
            ) : (
              <p className="tmpl-about-text">
                We are dedicated to providing the highest quality care in a comfortable and welcoming environment.
                Our experienced team uses the latest technology to ensure every visit is as pleasant as possible.
              </p>
            )}
          </div>
          {content.images?.logo && (
            <div className="tmpl-about-image">
              <img
                src={typeof content.images.logo === 'object' ? content.images.logo.url || '' : ''}
                alt={`${content.businessInfo?.businessName || 'Business'} logo`}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
