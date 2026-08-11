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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Sign in required." }, 401);
    const body = await req.json() as { bookingId?: string };
    if (!body.bookingId) return json({ error: "Invalid booking." }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const authClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: "Sign in required." }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: booking } = await admin.from("bookings").select("id, teacher_id, status, teacher_payout_cents, payout_transfer_id, payment_intent_id").eq("id", body.bookingId).maybeSingle();
    if (!booking || booking.status !== "confirmed") return json({ error: "This booking cannot be completed." }, 409);
    const { data: teacher } = await admin.from("teacher_profiles").select("user_id, stripe_account_id, stripe_onboarding_complete").eq("id", booking.teacher_id).maybeSingle();
    if (!teacher || teacher.user_id !== user.id) return json({ error: "You cannot complete this booking." }, 403);
    if (!booking.payment_intent_id || !booking.teacher_payout_cents || !teacher.stripe_account_id || !teacher.stripe_onboarding_complete) return json({ error: "Payout details are not ready." }, 409);

    const { error: statusError } = await admin.from("bookings").update({ status: "completed" }).eq("id", booking.id).eq("status", "confirmed");
    if (statusError) return json({ error: "We couldn’t complete this booking." }, 500);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-07-30.basil" });
    const intent = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
    const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id;
    if (!chargeId) return json({ error: "Payment payout is not ready." }, 409);
    const transfer = await stripe.transfers.create({ amount: booking.teacher_payout_cents, currency: "usd", destination: teacher.stripe_account_id, source_transaction: chargeId, metadata: { booking_id: booking.id } }, { idempotencyKey: `booking-payout-${booking.id}` });
    await admin.from("bookings").update({ payout_transfer_id: transfer.id }).eq("id", booking.id);
    return json({ completed: true }, 200);
  } catch (error) {
    console.error("complete booking failed", error);
    return json({ error: "We couldn’t complete this booking." }, 500);
  }
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
