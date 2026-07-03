import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  if (pathname === '/login') {
    if (authenticated) {
      return NextResponse.redirect(new URL('/dashboard/overview', request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/api/ai/:path*', '/api/sheets/:path*']
};
