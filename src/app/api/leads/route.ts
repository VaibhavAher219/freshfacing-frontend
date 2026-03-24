import { NextRequest, NextResponse } from 'next/server'

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://freshfacing-pipeline-production.up.railway.app'
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xfshkmpmdvfnphtornwe.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { url, email } = await request.json()
    if (!url || !email) {
      return NextResponse.json({ error: 'url and email are required' }, { status: 400 })
    }

    // derive a rough business name from the domain
    const hostname = new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace('www.', '')
    const business_name = hostname.split('.')[0].replace(/-/g, ' ')

    // kick off pipeline on Railway
    const railwayRes = await fetch(`${RAILWAY_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, business_name, city: '', state: '' }),
    })
    const { job_id } = await railwayRes.json()

    // patch email onto the lead row Railway already created in Supabase
    if (SUPABASE_KEY && job_id) {
      fetch(`${SUPABASE_URL}/rest/v1/leads?job_id=eq.${job_id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).catch(() => {})
    }

    return NextResponse.json({ job_id })
  } catch (error) {
    console.error('Lead error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
