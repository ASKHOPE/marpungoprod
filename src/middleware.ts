
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    if (!token) {
      // Not logged in, redirect to login
      // Ensure the req.url is used to construct the new URL to preserve host and port
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search); // Preserve query params too
      return NextResponse.redirect(loginUrl);
    }

    // Check if the role is admin
    if (token.role !== 'admin') {
      // Logged in, but not an admin, redirect to home
      const homeUrl = new URL('/', req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Allow the request to proceed if it's not an admin route or if the user is an admin
  return NextResponse.next();
}

// Specify which paths the middleware should apply to
export const config = {
  matcher: ['/admin/:path*'],
};
