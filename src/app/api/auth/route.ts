import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  const correctPassword = process.env.APP_PASSWORD;

  // 🔴 デバッグ用（超重要）
  console.log("入力:", password);
  console.log("正解:", correctPassword);

  if (!correctPassword) {
    return NextResponse.json(
      { error: "Server config error (no APP_PASSWORD)" },
      { status: 500 }
    );
  }

  // 🔥 ここが本体
  if (password !== correctPassword) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}