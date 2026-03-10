import { NextResponse } from 'next/server';

export function middleware(request) {
    const protocol = request.headers.get('x-forwarded-proto');
    const host = request.headers.get('host');

    // If the request is HTTP and we are in production, redirect to HTTPS
    if (protocol === 'http' && process.env.NODE_ENV === 'production') {
        const url = request.nextUrl.clone();
        url.protocol = 'https:';
        url.host = host; // Ensure host is preserved (optional but safer)
        return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
}

// Config to specify which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes) -> We might want to keep these protocol agnostic or enforce HTTPS too
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
