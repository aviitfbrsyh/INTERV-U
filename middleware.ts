import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept missing 3D assets to return an instant 404.
  // This prevents Next.js from compiling and rendering the heavy custom 404 page
  // for every single missing image, which blocks the dev server.
  if (pathname.startsWith('/3d/')) {
    return new NextResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/3d/:path*',
};
