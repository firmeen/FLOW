import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/config";
import { verifySession } from "@/lib/auth/token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", requestedPath);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/staff/:path*",
    "/kitchen/:path*",
    "/cashier/:path*",
    "/admin/:path*",
  ],
};
