// Seed script — run with: npx tsx src/seed.ts
// Creates demo tenant + site content for the walkthrough

import { getPayload } from 'payload'
import config from './payload.config.ts' with { type: 'typescript' }

async function seed() {
  console.log('Seeding database...\n')

  // We need to import the config from the root
  const configPath = require('path').resolve(__dirname, '..', 'payload.config.ts')

  // Use dynamic import for the config
  const payload = await getPayload({ config: (await import(configPath)).default })

  // Check if demo tenant already exists
  const existing = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'demo-dentist' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log('Demo data already exists. Skipping seed.')
    process.exit(0)
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
  console.log(`Created tenant: ${tenant.name} (${tenant.slug})`)

  // Create site content
  const content = await payload.create({
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
  console.log(`Created site content for: ${content.businessInfo?.businessName}`)

  // Create admin user
  const admin = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@freshfacing.com',
      password: 'admin123',
      role: 'admin',
    },
  })
  console.log(`Created admin user: ${admin.email} / admin123`)

  // Create demo client user
  const client = await payload.create({
    collection: 'users',
    data: {
      email: 'joe@joesdentistry.com',
      password: 'demo123',
      role: 'client',
      tenant: tenant.id,
    },
  })
  console.log(`Created client user: ${client.email} / demo123`)

  console.log('\n=== Seed Complete ===')
  console.log('\nDemo URLs:')
  console.log('  Marketing site:  http://localhost:3000')
  console.log('  Preview site:    http://localhost:3000/preview/demo-dentist')
  console.log('  Client site:     http://localhost:3000/demo-dentist')
  console.log('  Checkout:        http://localhost:3000/checkout/demo-dentist')
  console.log('  Client admin:    http://localhost:3000/client-admin')
  console.log('  Payload admin:   http://localhost:3000/admin')
  console.log('\nLogin credentials:')
  console.log('  Admin:  admin@freshfacing.com / admin123')
  console.log('  Client: joe@joesdentistry.com / demo123')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
