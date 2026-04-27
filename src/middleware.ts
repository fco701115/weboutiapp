
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string;
    const pathname = req.nextUrl.pathname;

    // Allow access to the admin login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Protection for all other /admin routes
    if (pathname.startsWith('/admin')) {
      // If they are logged in but not an admin/editor, redirect to home
      if (token && role !== 'SUPER_ADMIN' && role !== 'EDITOR') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Allow the login page without a token
        if (pathname === '/admin/login') return true;
        // Require a token for everything else under /admin
        return !!token;
      },
    },
    pages: {
      signIn: '/admin/login',
    }
  }
);

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
