import { NextResponse } from "next/server";

import {
  AuthConfigurationError,
  createSession,
  credentialsMatch,
  getInternalAuthConfig,
} from "@/lib/auth";

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const config = getInternalAuthConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Internal access is temporarily unavailable." },
      { status: 503 },
    );
  }

  if (!credentialsMatch(body.email, body.password, config)) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  try {
    await createSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json(
        { error: "Internal access is temporarily unavailable." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Sign in could not be completed. Please try again." },
      { status: 500 },
    );
  }
}
