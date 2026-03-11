import { NextResponse } from 'next/server'

// GET /api/health — checks if the database connection works
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    postgresUrlPrefix: process.env.POSTGRES_URL?.substring(0, 30) + '...',
    hasPayloadSecret: !!process.env.PAYLOAD_SECRET,
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
  }

  try {
    const { getPayloadClient } = await import('@/lib/payload')
    const payload = await getPayloadClient()
    // Try a simple query to verify DB connection
    const result = await payload.find({ collection: 'tenants', limit: 1 })
    diagnostics.dbConnected = true
    diagnostics.tenantCount = result.totalDocs
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    diagnostics.dbConnected = false
    diagnostics.dbError = message
    diagnostics.dbStack = stack?.split('\n').slice(0, 5)
  }

  return NextResponse.json(diagnostics, {
    status: diagnostics.dbConnected ? 200 : 500,
  })
}
