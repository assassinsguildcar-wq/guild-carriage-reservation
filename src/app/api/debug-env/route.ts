import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL ?? "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

    const testRes = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    const text = await testRes.text();

    return NextResponse.json({
      supabaseUrlExists: !!process.env.SUPABASE_URL,
      supabaseUrlValue: process.env.SUPABASE_URL ?? null,
      serviceRoleExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleFirst20: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20)
        : null,
      testStatus: testRes.status,
      testOk: testRes.ok,
      testBodyFirst200: text.slice(0, 200),
    });
  } catch (error) {
    return NextResponse.json({
      supabaseUrlExists: !!process.env.SUPABASE_URL,
      supabaseUrlValue: process.env.SUPABASE_URL ?? null,
      serviceRoleExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleFirst20: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20)
        : null,
      fetchError:
        error instanceof Error ? error.message : "Unknown fetch error",
    });
  }
}