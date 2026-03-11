import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// Public API for lead capture from marketing site audit scanner
export async function POST(request: NextRequest) {
  try {
    const { url, email, auditScore } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    const lead = await payload.create({
      collection: 'leads',
      data: {
        url: url || '',
        email,
        auditScore: auditScore || 0,
        status: 'new',
      },
    })

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }
}
