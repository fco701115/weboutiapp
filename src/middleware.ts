
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string;
    const pathname = req.nextUrl.pathname;

    // Allow access to the admin login page even if not authorized
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin/editor roles
    if (pathname.startsWith('/admin')) {
      if (!role || (role !== 'SUPER_ADMIN' && role !== 'EDITOR')) {
        // If they are logged in but not an admin, redirect to home
        if (token) {
           return NextResponse.redirect(new URL('/', req.url));
        }
        // If not logged in at all, the withAuth will handle redirect to signIn page (next-auth setting)
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname === '/admin/login') return true;
        return !!token;
      },
    },
    pages: {
      signIn: '/admin/login',
    }
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
