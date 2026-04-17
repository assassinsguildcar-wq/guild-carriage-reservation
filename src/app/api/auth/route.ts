import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (isAuthenticated(request)) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "AUTH_BYPASS_TEST_001",
  });

  setSessionCookie(response);
  return response;
}