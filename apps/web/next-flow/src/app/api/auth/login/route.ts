import { NextResponse } from "next/server";

/**
 * Retained only as a transition tombstone until P02/R06 removes the legacy
 * endpoint. Live credential authentication is owned exclusively by Auth.js at
 * /api/auth/[...nextauth].
 */
export async function POST() {
  return NextResponse.json(
    { error: "This sign-in endpoint is no longer available." },
    { status: 410 },
  );
}
