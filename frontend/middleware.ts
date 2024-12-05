import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin/auth") ||
    pathname.startsWith("/admin/auth")
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/student/auth/") ||
    pathname.startsWith("/student/auth")
  ) {
    return NextResponse.next();
  }
  if (
    pathname.startsWith("/teacher/auth") ||
    pathname.startsWith("/teacher/auth")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/super-admin/signin/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-token");
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/auth/signin", request.url));
    }
  }

  if (pathname.startsWith("/student")) {
    const studentToken = request.cookies.get("student-token");
    if (!studentToken) {
      return NextResponse.redirect(
        new URL("/student/auth/signin", request.url)
      );
    }
  }
  if (pathname.startsWith("/teacher")) {
    const studentToken = request.cookies.get("teacher-token");
    if (!studentToken) {
      return NextResponse.redirect(
        new URL("/teacher/auth/signin", request.url)
      );
    }
  }

  if (pathname.startsWith("/super-admin")) {
    const studentToken = request.cookies.get("super-admin-token");
    if (!studentToken) {
      return NextResponse.redirect(new URL("/super-admin/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/teacher/:path*",
    "/super-admin/:path*",
  ],
};
