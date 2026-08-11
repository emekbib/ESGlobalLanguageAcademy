import Stripe from "npm:stripe@18.5.0";
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-07-30.basil" });
    const signature = req.headers.get("stripe-signature");
    if (!signature) return json({ error: "Missing signature." }, 400);
    const payload = await req.text();
    const event = await stripe.webhooks.constructEventAsync(payload, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (bookingId && session.payment_status === "paid") {
        await admin.from("bookings").update({ status: "confirmed", payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id }).eq("id", bookingId).eq("status", "pending");
        EdgeRuntime.waitUntil(createDailyRoom(bookingId));
      }
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) await admin.from("bookings").update({ status: "cancelled" }).eq("id", bookingId).eq("status", "pending");
    }
    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;
      if (bookingId) await admin.from("bookings").update({ status: "cancelled" }).eq("id", bookingId).eq("status", "pending");
    }
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      await admin.from("teacher_profiles").update({ stripe_onboarding_complete: Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled) }).eq("stripe_account_id", account.id);
    }
    return json({ received: true }, 200);
  } catch (error) {
    console.error("stripe webhook failed", error);
    return json({ error: "Webhook processing failed." }, 400);
  }
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function createDailyRoom(bookingId: string) {
  try {
    const apiKey = Deno.env.get("DAILY_API_KEY");
    if (!apiKey) return;
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: booking } = await admin.from("bookings").select("id, daily_room_url").eq("id", bookingId).maybeSingle();
    if (!booking || booking.daily_room_url) return;

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        privacy: "private",
        properties: {
          nbf: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          enable_prejoin_ui: true,
          enable_screenshare: true,
          enable_chat: true,
        },
      }),
    });
    if (!res.ok) {
      console.error("Daily room creation failed", res.status, await res.text());
      return;
    }
    const room = await res.json() as { url?: string };
    if (room.url) await admin.from("bookings").update({ daily_room_url: room.url }).eq("id", bookingId);
  } catch (error) {
    console.error("create daily room in webhook failed", error);
  }
}
