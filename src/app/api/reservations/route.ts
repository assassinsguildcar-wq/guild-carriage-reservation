import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function getMonthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function getLimitDate() {
  const today = new Date();
  const endOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 2,
    0
  );
  return endOfNextMonth.toISOString().slice(0, 10);
}

function getMonthStartEndFromDate(date: string) {
  const d = new Date(date);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  return { monthStart, monthEnd };
}

// 予約一覧取得
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (!month) {
    return NextResponse.json({ error: "month required" }, { status: 400 });
  }

  const { start, end } = getMonthRange(month);

  const { data, error } = await supabaseServer
    .from("reservations")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reservations: data ?? [] });
}

// 新規予約
export async function POST(req: NextRequest) {
  const { date, member_name } = await req.json();

  if (!date || !member_name) {
    return NextResponse.json({ error: "missing data" }, { status: 400 });
  }

  const limit = getLimitDate();

  if (date > limit) {
    return NextResponse.json({ error: "too far" }, { status: 400 });
  }

  // 同じ日付に既に予約があるか
  const { data: existingReservation, error: existingError } = await supabaseServer
    .from("reservations")
    .select("id")
    .eq("date", date)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingReservation) {
    return NextResponse.json({ error: "already reserved" }, { status: 400 });
  }

  // その月の予約回数チェック
  const { monthStart, monthEnd } = getMonthStartEndFromDate(date);

  const { data: memberReservations, error: countError } = await supabaseServer
    .from("reservations")
    .select("id")
    .eq("member_name", member_name)
    .gte("date", monthStart)
    .lte("date", monthEnd);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((memberReservations?.length ?? 0) >= 2) {
    return NextResponse.json({ error: "limit reached" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("reservations")
    .insert([{ date, member_name }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Discord通知（新規予約）
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `📦 A new reservation has been added!
Name: ${member_name}
Date: ${date}`,
        }),
      });
    }
  } catch (error) {
    console.error("Discord notification error:", error);
  }

  return NextResponse.json({ success: true });
}

// 予約編集
export async function PATCH(req: NextRequest) {
  const { old_date, new_date, member_name, operator } = await req.json();

  if (!old_date || !new_date || !member_name || !operator) {
    return NextResponse.json({ error: "missing data" }, { status: 400 });
  }

  const limit = getLimitDate();

  if (new_date > limit) {
    return NextResponse.json({ error: "too far" }, { status: 400 });
  }

  // 元の予約を取得
  const { data: oldReservation, error: oldReservationError } = await supabaseServer
    .from("reservations")
    .select("*")
    .eq("date", old_date)
    .maybeSingle();

  if (oldReservationError) {
    return NextResponse.json({ error: oldReservationError.message }, { status: 500 });
  }

  if (!oldReservation) {
    return NextResponse.json({ error: "original reservation not found" }, { status: 404 });
  }

  // 日付を変える場合、新しい日付が空いているかチェック
  if (old_date !== new_date) {
    const { data: targetReservation, error: targetError } = await supabaseServer
      .from("reservations")
      .select("id")
      .eq("date", new_date)
      .maybeSingle();

    if (targetError) {
      return NextResponse.json({ error: targetError.message }, { status: 500 });
    }

    if (targetReservation) {
      return NextResponse.json({ error: "target date already reserved" }, { status: 400 });
    }
  }

  // 月2回チェック
  const { monthStart, monthEnd } = getMonthStartEndFromDate(new_date);

  const { data: sameMemberReservations, error: countError } = await supabaseServer
    .from("reservations")
    .select("date, member_name")
    .eq("member_name", member_name)
    .gte("date", monthStart)
    .lte("date", monthEnd);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const countExcludingOld = (sameMemberReservations ?? []).filter(
    (r) => r.date !== old_date
  ).length;

  if (countExcludingOld >= 2) {
    return NextResponse.json({ error: "limit reached" }, { status: 400 });
  }

  const { error: updateError } = await supabaseServer
    .from("reservations")
    .update({
      date: new_date,
      member_name,
    })
    .eq("date", old_date);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Discord通知（予約編集）
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `✏️ A reservation has been updated!
Old name: ${oldReservation.member_name}
New name: ${member_name}
Old date: ${old_date}
New date: ${new_date}
Operator: ${operator}`,
        }),
      });
    }
  } catch (error) {
    console.error("Discord notification error:", error);
  }

  return NextResponse.json({ success: true });
}

// 予約削除
export async function DELETE(req: NextRequest) {
  const { date } = await req.json();

  if (!date) {
    return NextResponse.json({ error: "missing date" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("reservations")
    .delete()
    .eq("date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}