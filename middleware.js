import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function middleware(request) {
    const response = NextResponse.next();
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

    // Load the auth store from the cookie
    // Load the auth store from the cookie
    pb.authStore.loadFromCookie(request.headers.get('cookie') || '');

    // We do NOT call authRefresh() here to prevent infinite redirect loops 
    // and overwhelming the PocketBase server on every route change.
    // pb.authStore.isValid already locally checks if the JWT is expired.

    const isLoggedIn = pb.authStore.isValid;
    const isLoginPage = request.nextUrl.pathname.startsWith('/login');

    // Define protected routes (add more as needed)
    const isProtectedRoute = !isLoginPage && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/static') && !request.nextUrl.pathname.match(/\.(.*)$/);

    if (isLoggedIn && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (!isLoggedIn && isProtectedRoute && request.nextUrl.pathname !== '/') {
        // Allow access to root if it's public, otherwise redirect. 
        // Assuming root '/' is the dashboard and should be protected:
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Special case: if root is protected and user is not logged in
    if (!isLoggedIn && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
