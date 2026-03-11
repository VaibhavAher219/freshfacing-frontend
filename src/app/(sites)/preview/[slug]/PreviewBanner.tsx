'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_SITES, DEMO_SLUGS } from '@/lib/demo-data'
import type { DemoSite } from '@/lib/demo-data'

interface PreviewBannerProps {
  slug: string
}

export function PreviewBanner({ slug }: PreviewBannerProps) {
  const router = useRouter()
  const [showComparison, setShowComparison] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const demo: DemoSite | undefined = DEMO_SITES[slug]

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowComparison(false)
      }
    }
    if (showComparison) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showComparison])

  // Prefetch the other demo
  useEffect(() => {
    DEMO_SLUGS.forEach((s) => {
      if (s !== slug) router.prefetch(`/preview/${s}`)
    })
  }, [slug, router])

  if (!demo) return null

  return (
    <div className="demo-banner-wrapper" ref={popoverRef}>
      <div className="demo-banner">
        <div className="demo-banner-inner">
          {/* Demo tabs */}
          <div className="demo-tabs">
            {DEMO_SLUGS.map((s) => (
              <button
                key={s}
                className={`demo-tab ${s === slug ? 'demo-tab-active' : ''}`}
                onClick={() => {
                  if (s !== slug) {
                    setShowComparison(false)
                    router.push(`/preview/${s}`)
                  }
                }}
              >
                {DEMO_SITES[s].label}
              </button>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="demo-banner-actions">
            <button
              className="demo-why-btn"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Close' : 'Why is this better?'}
            </button>
            <a href="/#cta" className="demo-cta-btn">
              Get Started — $20/mo
            </a>
          </div>
        </div>
      </div>

      {/* Comparison popover */}
      <div className={`demo-popover ${showComparison ? 'demo-popover-open' : ''}`}>
        <div className="demo-popover-inner">
          <div className="demo-popover-header">
            <h3>
              What we fixed for <span>{demo.label}</span>
            </h3>
            <p className="demo-popover-sub">
              Their old site was losing them customers. Here&apos;s what we changed and why it matters.
            </p>
          </div>

          <div className="demo-popover-grid">
            {/* Old site issues */}
            <div className="demo-popover-col demo-popover-bad">
              <div className="demo-popover-col-header">
                <span className="demo-popover-indicator demo-popover-indicator-bad" />
                Their old site
              </div>
              {demo.originalIssues.map((item, i) => (
                <div key={i} className="demo-popover-item">
                  <span className="demo-popover-icon">{item.icon}</span>
                  <div>
                    <div className="demo-popover-item-title">{item.issue}</div>
                    <div className="demo-popover-item-detail">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* FreshFacing improvements */}
            <div className="demo-popover-col demo-popover-good">
              <div className="demo-popover-col-header">
                <span className="demo-popover-indicator demo-popover-indicator-good" />
                What FreshFacing built
              </div>
              {demo.improvements.map((item, i) => (
                <div key={i} className="demo-popover-item">
                  <span className="demo-popover-icon">{item.icon}</span>
                  <div>
                    <div className="demo-popover-item-title">{item.improvement}</div>
                    <div className="demo-popover-item-detail">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="demo-popover-footer">
            A better website means more calls, more trust, and more customers.
            <a href="/#cta" className="demo-cta-btn demo-cta-btn-lg">
              Get Your Site — $20/mo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
