import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token?.role === "ADMIN" && pathname.startsWith("/anggota")) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  if (token?.role === "ANGGOTA" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/anggota/katalog", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/anggota/:path*", "/login"],
};