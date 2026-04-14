import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("members")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: data });
}

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("members")
    .insert([{ name }]);

await supabaseServer.from("member_logs").insert([
  {
    action: "add",
    name,
  },
]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}