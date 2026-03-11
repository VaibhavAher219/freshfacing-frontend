import { NextRequest, NextResponse } from 'next/server'

// Custom domain routing middleware
// In production, this maps custom domains to tenant slugs
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Skip internal routes
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/client-admin') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/media') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // In production, check if hostname is a custom domain
  // For local dev, just pass through
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isFreshFacing = hostname.includes('freshfacing.com')
  const isVercel = hostname.includes('.vercel.app')

  if (!isLocalhost && !isFreshFacing && !isVercel) {
    // Custom domain — rewrite to dynamic site route
    // The domain → slug mapping would come from a database lookup
    // For now, we pass the hostname as a header for the page to resolve
    const url = request.nextUrl.clone()
    url.pathname = `/custom-domain`
    url.searchParams.set('domain', hostname)
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
