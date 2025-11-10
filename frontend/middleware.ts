import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('authToken')

  // If the user is authenticated and trying to access the landing page or auth page
  if (authToken && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If the user is not authenticated and trying to access protected routes
  if (!authToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/auth', '/dashboard/:path*']
}