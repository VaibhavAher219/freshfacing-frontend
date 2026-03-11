'use client'

import { PreviewBanner } from './PreviewBanner'
import { DEMO_SITES } from '@/lib/demo-data'

interface PreviewWrapperProps {
  slug: string
}

export function PreviewWrapper({ slug }: PreviewWrapperProps) {
  const demo = DEMO_SITES[slug]
  if (!demo) return null

  return (
    <div className="demo-preview-page">
      <PreviewBanner slug={slug} />
      <div className="demo-iframe-container">
        <iframe
          src={demo.sampleUrl}
          className="demo-iframe"
          title={`${demo.label} — Preview`}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
