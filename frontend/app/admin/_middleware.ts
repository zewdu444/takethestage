import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  console.log('Middleware executed');
  const adminToken = req.cookies.get('admin-token');

  if (!adminToken) {
    console.log('No admin token found, redirecting...');
    return NextResponse.redirect(new URL('/admin/auth/signin', req.url));
  }

  console.log('Admin token found, proceeding...');
  return NextResponse.next();
}