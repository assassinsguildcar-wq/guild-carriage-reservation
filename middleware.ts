import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "guild_session";
const SESSION_MESSAGE = "guild_carriage_v1";

async function computeSessionToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(SESSION_MESSAGE)
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  const cookie = request.cookies.get(COOKIE_NAME);

  if (!secret || !cookie?.value) {
    return NextResponse.next();
  }

  const expected = await computeSessionToken(secret);

  if (cookie.value !== expected) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/calendar/:path*", "/history/:path*"],
};