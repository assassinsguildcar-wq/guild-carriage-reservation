import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const COOKIE_NAME = "guild_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24;

const SESSION_MESSAGE = "guild_carriage_v1";

export function computeSessionToken(secret: string): string {
  return createHmac("sha256", secret)
    .update(SESSION_MESSAGE)
    .digest("hex");
}

export function setSessionCookie(response: NextResponse): void {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured.");

  const token = computeSessionToken(secret);

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return false;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const expected = computeSessionToken(secret);
  return cookie.value === expected;
}