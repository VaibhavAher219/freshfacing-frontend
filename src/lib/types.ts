// Types matching our Payload collections
export interface SiteContentData {
  id?: string | number
  tenant?: any
  businessInfo?: {
    businessName?: string
    tagline?: string
    phone?: string
    email?: string
    address?: string
  }
  hours?: Array<{
    day: string
    open?: string
    close?: string
    closed?: boolean
  }>
  services?: Array<{
    name: string
    description?: string
  }>
  aboutText?: any // Lexical rich text
  hero?: {
    headline?: string
    subtext?: string
    ctaText?: string
    ctaLink?: string
  }
  images?: {
    logo?: any
    heroImage?: any
    gallery?: Array<{
      image?: any
      caption?: string
    }>
  }
  socialLinks?: {
    facebook?: string
    instagram?: string
    yelp?: string
    google?: string
  }
  seo?: {
    title?: string
    description?: string
  }
  theme?: {
    primaryColor?: string
    accentColor?: string
  }
}

export interface TenantData {
  id: string
  name: string
  slug: string
  status: 'preview' | 'active' | 'suspended' | 'churned'
  industry: string
  template?: string
  customDomain?: string
  domainVerified?: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionPlan?: 'monthly' | 'annual'
  subscriptionStatus?: 'none' | 'active' | 'past_due' | 'canceled'
}

export interface UpsellService {
  id: string
  name: string
  description: string
  price: number
  priceType: 'one-time' | 'monthly'
  stripeProductId?: string
}

export const UPSELL_CATALOG: UpsellService[] = [
  {
    id: 'seo_package',
    name: 'SEO Starter Package',
    description: 'On-page SEO optimization, Google Search Console setup, keyword research, and meta tag optimization to help your site rank higher in local search results.',
    price: 99,
    priceType: 'one-time',
  },
  {
    id: 'google_business',
    name: 'Google Business Profile Setup',
    description: 'Complete setup and optimization of your Google Business Profile so you show up in Maps and local search results.',
    price: 49,
    priceType: 'one-time',
  },
  {
    id: 'monthly_blog',
    name: 'Monthly Blog Posts',
    description: '4 professionally written blog posts per month to keep your site fresh and improve SEO rankings.',
    price: 79,
    priceType: 'monthly',
  },
  {
    id: 'logo_design',
    name: 'Custom Logo Design',
    description: 'A professional, custom-designed logo with 3 concepts and 2 rounds of revisions.',
    price: 149,
    priceType: 'one-time',
  },
  {
    id: 'social_media',
    name: 'Social Media Profile Setup',
    description: 'Setup and branding of your Facebook, Instagram, and Google profiles with consistent visuals and descriptions.',
    price: 69,
    priceType: 'one-time',
  },
]
