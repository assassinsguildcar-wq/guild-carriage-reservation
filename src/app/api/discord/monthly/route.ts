import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function getMonthStartEnd(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    year,
    monthNumber,
    daysInMonth: end.getDate(),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function POST(req: NextRequest) {
  try {
    const { month } = await req.json();

    if (!month) {
      return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "DISCORD_WEBHOOK_URL is not set" },
        { status: 500 }
      );
    }

    const { start, end, year, monthNumber, daysInMonth } = getMonthStartEnd(month);

    const { data, error } = await supabaseServer
      .from("reservations")
      .select("date, member_name")
      .gte("date", start)
      .lte("date", end)
      .order("date");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reservations = data ?? [];

    const reservedMap = new Map<string, string>();
    for (const r of reservations) {
      reservedMap.set(r.date, r.member_name);
    }

    const reservedLines: string[] = [];
    const openLines: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${pad(monthNumber)}-${pad(day)}`;
      const shortDate = `${pad(monthNumber)}/${pad(day)}`;

      if (reservedMap.has(dateStr)) {
        reservedLines.push(`${shortDate} - ${reservedMap.get(dateStr)}`);
      } else {
        openLines.push(shortDate);
      }
    }

    const message =
      `📅 Carriage Reservations for ${year}-${pad(monthNumber)}\n\n` +
      `Reserved\n` +
      `${reservedLines.length > 0 ? reservedLines.join("\n") : "None"}\n\n` +
      `Open Dates\n` +
      `${openLines.length > 0 ? openLines.join("\n") : "None"}`;

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      return NextResponse.json(
        { error: `Discord webhook failed: ${discordRes.status} ${errorText}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}