import "server-only";

export const CUSTOMER_CAPABILITY_COOKIE_NAME = "flow_customer_capability_v1";
export const CUSTOMER_CAPABILITY_MAX_AGE_SECONDS = 4 * 60 * 60;
export const CUSTOMER_CAPABILITY_ISSUER = "flow";
export const CUSTOMER_CAPABILITY_AUDIENCE = "foodflow-customer";

export class CustomerCapabilityConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerCapabilityConfigurationError";
  }
}

export function getCustomerCapabilitySecret(): string {
  const secret = process.env.CUSTOMER_CAPABILITY_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new CustomerCapabilityConfigurationError(
      "Customer capability signing is not configured.",
    );
  }
  return secret;
}

export function customerCapabilityCookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CUSTOMER_CAPABILITY_MAX_AGE_SECONDS,
    expires: new Date(expiresAt * 1000),
  };
}
