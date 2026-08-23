import "server-only";

import type { NextResponse } from "next/server";

import {
  CUSTOMER_CAPABILITY_COOKIE_NAME,
  customerCapabilityCookieOptions,
} from "./config";

export function setCustomerCapabilityCookie(
  response: NextResponse,
  token: string,
  expiresAt: number,
): void {
  response.cookies.set(
    CUSTOMER_CAPABILITY_COOKIE_NAME,
    token,
    customerCapabilityCookieOptions(expiresAt),
  );
}

export function clearCustomerCapabilityCookie(response: NextResponse): void {
  response.cookies.set(CUSTOMER_CAPABILITY_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
