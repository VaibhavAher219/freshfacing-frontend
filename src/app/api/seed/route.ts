import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// GET /api/seed — creates demo data for the walkthrough
// In production, requires ?key=PAYLOAD_SECRET for safety
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    if (!key || key !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Seed requires ?key=PAYLOAD_SECRET in production' }, { status: 403 })
    }
  }

  const payload = await getPayloadClient()

  // Check if demo tenant already exists
  const existing = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'demo-dentist' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return NextResponse.json({
      message: 'Demo data already exists',
      urls: getUrls(),
      credentials: getCredentials(),
    })
  }

  // Create demo tenant
  const tenant = await payload.create({
    collection: 'tenants',
    data: {
      name: "Joe's Family Dentistry",
      slug: 'demo-dentist',
      status: 'preview',
      industry: 'dental',
      template: 'dental-classic',
    },
  })

  // Create site content
  await payload.create({
    collection: 'site-content',
    data: {
      tenant: tenant.id,
      businessInfo: {
        businessName: "Joe's Family Dentistry",
        tagline: 'Your smile is our passion',
        phone: '(555) 234-5678',
        email: 'hello@joesdentistry.com',
        address: '123 Main Street, Suite 100\nAnytown, CA 90210',
      },
      hours: [
        { day: 'Monday', open: '8:00 AM', close: '5:00 PM', closed: false },
        { day: 'Tuesday', open: '8:00 AM', close: '5:00 PM', closed: false },
        { day: 'Wednesday', open: '8:00 AM', close: '6:00 PM', closed: false },
        { day: 'Thursday', open: '8:00 AM', close: '5:00 PM', closed: false },
        { day: 'Friday', open: '9:00 AM', close: '3:00 PM', closed: false },
        { day: 'Saturday', open: '9:00 AM', close: '1:00 PM', closed: false },
        { day: 'Sunday', open: '', close: '', closed: true },
      ],
      services: [
        { name: 'General Dentistry', description: 'Comprehensive exams, cleanings, fillings, and preventive care for the whole family.' },
        { name: 'Teeth Whitening', description: 'Professional in-office and take-home whitening treatments for a brighter smile.' },
        { name: 'Dental Implants', description: 'Permanent tooth replacement solutions that look and feel natural.' },
        { name: 'Orthodontics', description: 'Clear aligners and traditional braces for children and adults.' },
        { name: 'Emergency Care', description: 'Same-day appointments available for dental emergencies.' },
        { name: 'Cosmetic Dentistry', description: 'Veneers, bonding, and smile makeovers to enhance your confidence.' },
      ],
      hero: {
        headline: "Your Family's Smile Starts Here",
        subtext: 'Providing gentle, comprehensive dental care for patients of all ages. Our experienced team uses the latest technology to ensure every visit is comfortable and effective.',
        ctaText: 'Book an Appointment',
        ctaLink: '#contact',
      },
      socialLinks: {
        facebook: 'https://facebook.com/joesdentistry',
        instagram: 'https://instagram.com/joesdentistry',
        yelp: 'https://yelp.com/biz/joes-family-dentistry',
        google: 'https://g.page/joesdentistry',
      },
      seo: {
        title: "Joe's Family Dentistry | Anytown, CA | General & Cosmetic Dentist",
        description: 'Trusted family dentist in Anytown, CA. Offering general dentistry, teeth whitening, implants, orthodontics, and emergency care. Call (555) 234-5678.',
      },
      theme: {
        primaryColor: '#2d6a4f',
        accentColor: '#e8a830',
      },
    },
  })

  // Create admin user
  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@freshfacing.com',
        password: 'admin123',
        role: 'admin',
      },
    })
  } catch {
    // User may already exist
  }

  // Create demo client user
  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'joe@joesdentistry.com',
        password: 'demo123',
        role: 'client',
        tenant: tenant.id,
      },
    })
  } catch {
    // User may already exist
  }

  return NextResponse.json({
    message: 'Demo data seeded successfully!',
    urls: getUrls(),
    credentials: getCredentials(),
  })
}

function getUrls() {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return {
    marketing: base,
    preview: `${base}/preview/demo-dentist`,
    clientSite: `${base}/demo-dentist`,
    checkout: `${base}/checkout/demo-dentist`,
    clientAdmin: `${base}/client-admin`,
    payloadAdmin: `${base}/admin`,
  }
}

function getCredentials() {
  return {
    admin: { email: 'admin@freshfacing.com', password: 'admin123' },
    client: { email: 'joe@joesdentistry.com', password: 'demo123' },
  }
}
