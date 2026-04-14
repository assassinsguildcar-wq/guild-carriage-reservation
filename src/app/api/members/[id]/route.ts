import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Member id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("members")
      .delete()
      .eq("id", id);

    await supabaseServer.from("member_logs").insert([
      {
        action: "delete",
        name: id,
      },
    ]);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/members/[id] error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Member id is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("members")
      .update({ name })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}