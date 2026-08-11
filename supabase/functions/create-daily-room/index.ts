import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("DAILY_API_KEY");
    if (!apiKey) return json({ error: "Daily API key not configured." }, 500);

    const { bookingId } = await req.json() as { bookingId?: string };
    if (!bookingId) return json({ error: "Missing booking ID." }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: booking } = await admin
      .from("bookings")
      .select("id, start_time_utc, end_time_utc, daily_room_url")
      .eq("id", bookingId)
      .maybeSingle();
    if (!booking) return json({ error: "Booking not found." }, 404);
    if (booking.daily_room_url) return json({ url: booking.daily_room_url }, 200);

    const start = new Date(booking.start_time_utc);
    const end = new Date(booking.end_time_utc);
    const nbf = Math.floor(start.getTime() / 1000) - 10 * 60;
    const exp = Math.floor(end.getTime() / 1000) + 60 * 60;

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        privacy: "private",
        properties: {
          nbf,
          exp,
          enable_prejoin_ui: true,
          enable_network_ui: false,
          enable_screenshare: true,
          enable_chat: true,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Daily room creation failed", res.status, text);
      return json({ error: "Could not create video room." }, 502);
    }

    const room = await res.json() as { url?: string };
    if (!room.url) return json({ error: "Could not create video room." }, 502);

    await admin.from("bookings").update({ daily_room_url: room.url }).eq("id", bookingId);
    return json({ url: room.url }, 200);
  } catch (error) {
    console.error("create daily room failed", error);
    return json({ error: "Could not create video room." }, 500);
  }
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
