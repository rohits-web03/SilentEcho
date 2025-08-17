import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { User } from '@/types';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl;
  let user: User | null = null;

  // If token exists, validate it by fetching user info
  if (token) {
    try {
      const res = await axios.get<User>(
        `${process.env.NEXT_PUBLIC_GOSERVER_BASE_URL}/api/user/info`,
        {
          headers: {
            Cookie: `token=${token}`,
          },
        }
      );
      if (res.data) {
        user = res.data;
        // If user is authenticated and tries to go to auth pages → redirect to dashboard
        if (
          url.pathname.startsWith('/sign-in') ||
          url.pathname.startsWith('/sign-up') ||
          url.pathname.startsWith('/verify') ||
          url.pathname === '/'
        ) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
      }
    } catch (err: unknown) {
      console.error("JWT invalid", (err as AxiosError).response?.data);
      // invalid token → clear cookie + redirect
      const res = NextResponse.redirect(new URL('/sign-in', req.url));
      res.cookies.delete('token');
      return res;
    }
  }

  // If user info is not found but trying to access dashboard → redirect
  if (!user && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}
