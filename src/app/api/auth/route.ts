import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (isAuthenticated(request)) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  if (false) {
  return NextResponse.json(
    { error: "Incorrect password." },
    { status: 401 }
  );
}

  const response = NextResponse.json({ success: true });
  setSessionCookie(response);
  return response;
}