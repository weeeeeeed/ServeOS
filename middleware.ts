import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read cookies set by auth service / Supabase
  const userRole = request.cookies.get('qr_user_role')?.value;
  const userId = request.cookies.get('qr_user_id')?.value;
  const isAuthenticated = Boolean(userId && userRole);

  // 1. Check Owner Dashboard Protection
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(url);
    }

    if (userRole === 'admin') {
      // Admins should be on /admin
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Role is owner - allow
    return NextResponse.next();
  }

  // 2. Check Super Admin Dashboard Protection
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('reason', 'admin_required');
      return NextResponse.redirect(url);
    }

    if (userRole !== 'admin') {
      // Non-admin attempting to access admin route -> redirect to owner dashboard
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('error', 'unauthorized_admin_access');
      return NextResponse.redirect(url);
    }

    // Role is admin - allow
    return NextResponse.next();
  }

  // 3. Prevent logged-in users from viewing /login and /register
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow all other public routes (e.g. /, /[slug], assets)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
