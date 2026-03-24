import { NextRequest, NextResponse } from 'next/server'

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://freshfacing-pipeline-production.up.railway.app'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const res = await fetch(`${RAILWAY_URL}/jobs/${id}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: 'running' })
  }
}
