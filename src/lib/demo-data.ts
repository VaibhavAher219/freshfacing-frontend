export type DemoIssue = {
  icon: string
  issue: string
  detail: string
}

export type DemoImprovement = {
  icon: string
  improvement: string
  detail: string
}

export type DemoSite = {
  slug: string
  label: string
  industry: string
  sampleUrl: string
  originalIssues: DemoIssue[]
  improvements: DemoImprovement[]
}

export const DEMO_SITES: Record<string, DemoSite> = {
  'demo-reese-hvac': {
    slug: 'demo-reese-hvac',
    label: 'Reese Heating & Air',
    industry: 'HVAC',
    sampleUrl: '/samples/reese.html',
    originalIssues: [
      {
        icon: '🐌',
        issue: 'Built on GoDaddy Website Builder',
        detail: 'Slow, bloated platform with poor SEO fundamentals and limited customization.',
      },
      {
        icon: '📱',
        issue: 'Not mobile-optimized',
        detail: 'Breaks on phones where 70%+ of "HVAC near me" searches happen.',
      },
      {
        icon: '📞',
        issue: 'No click-to-call',
        detail: 'Phone number buried in text — not tappable on mobile devices.',
      },
      {
        icon: '📝',
        issue: 'No service request form',
        detail: 'Visitors have no way to take action online — lost leads around the clock.',
      },
      {
        icon: '👨‍👩‍👦',
        issue: 'Family story hidden',
        detail: '5 generations of trust — their biggest differentiator — was nowhere on the site.',
      },
      {
        icon: '🔍',
        issue: 'No structured data or local SEO',
        detail: 'Invisible to Google rich results. No service area pages for surrounding cities.',
      },
    ],
    improvements: [
      {
        icon: '✅',
        improvement: 'Mobile-first responsive design',
        detail: 'Perfect on every device — phone, tablet, desktop.',
      },
      {
        icon: '✅',
        improvement: 'Click-to-call everywhere',
        detail: 'Phone in nav, hero, and emergency strip — one tap to call.',
      },
      {
        icon: '✅',
        improvement: 'Service request form on homepage',
        detail: 'Captures leads 24/7 — even when the office is closed.',
      },
      {
        icon: '✅',
        improvement: '5-generation family story front and center',
        detail: 'Timeline, family photo, and legacy — builds trust instantly.',
      },
      {
        icon: '✅',
        improvement: 'Full SEO with local schema',
        detail: 'Meta tags, structured data, semantic HTML. 16+ named service areas.',
      },
      {
        icon: '✅',
        improvement: 'Financing & BBB trust signals',
        detail: 'A+ BBB rating and financing options prominently displayed.',
      },
    ],
  },
  'demo-golden-needle': {
    slug: 'demo-golden-needle',
    label: 'Golden Needle Tailor Shop',
    industry: 'Tailors & Alterations',
    sampleUrl: '/samples/golden-needle.html',
    originalIssues: [
      {
        icon: '🕸️',
        issue: 'Outdated design',
        detail: 'Looks like it was built in the early 2000s — drives customers away.',
      },
      {
        icon: '📍',
        issue: 'Missing address and hours',
        detail: 'Customers literally cannot find or visit the shop from the website.',
      },
      {
        icon: '🎟️',
        issue: 'Expired coupons still showing',
        detail: 'Makes the business look abandoned and neglected.',
      },
      {
        icon: '📱',
        issue: 'No mobile layout',
        detail: 'Completely unusable on phones — unreadable text, broken layout.',
      },
      {
        icon: '🔍',
        issue: 'No local SEO or Google integration',
        detail: 'Doesn\'t show up for "tailor near me" searches.',
      },
      {
        icon: '⭐',
        issue: 'No reviews or social proof',
        detail: 'Missing trust signals — visitors have no reason to choose them.',
      },
    ],
    improvements: [
      {
        icon: '✅',
        improvement: 'Premium modern design',
        detail: 'Herringbone textures, serif typography — matches the craft of tailoring.',
      },
      {
        icon: '✅',
        improvement: 'Address, phone, hours prominently displayed',
        detail: 'With Google Maps link — customers can find and visit easily.',
      },
      {
        icon: '✅',
        improvement: '53-year timeline and family story',
        detail: 'Establishes legacy, trust, and deep community roots.',
      },
      {
        icon: '✅',
        improvement: 'Real customer reviews featured',
        detail: '5-star reviews with quotes — instant social proof.',
      },
      {
        icon: '✅',
        improvement: 'Mobile-responsive with elegant stacking',
        detail: 'Looks beautiful on any screen size.',
      },
      {
        icon: '✅',
        improvement: 'Full SEO with local schema',
        detail: 'Shows up in "tailor near me" and "alterations Kalamazoo" searches.',
      },
    ],
  },
}

export const DEMO_SLUGS = Object.keys(DEMO_SITES)

export function isDemoSlug(slug: string): boolean {
  return slug in DEMO_SITES
}
