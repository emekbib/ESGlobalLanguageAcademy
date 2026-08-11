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
    const body = await req.json() as { teacherId?: string; startUtc?: string; endUtc?: string };
    if (!body.teacherId || !body.startUtc || !body.endUtc) return json({ error: "Invalid booking details." }, 400);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: "Sign in required." }, 401);

    const admin = createClient(url, serviceKey);
    const { data: teacher, error: teacherError } = await admin
      .from("teacher_profiles")
      .select("id, hourly_rate, stripe_account_id, stripe_onboarding_complete")
      .eq("id", body.teacherId)
      .eq("is_published", true)
      .maybeSingle();
    if (teacherError || !teacher) return json({ error: "Teacher not found." }, 404);
    if (!teacher.stripe_account_id || !teacher.stripe_onboarding_complete) return json({ error: "This teacher is not ready to accept bookings yet." }, 409);

    const start = new Date(body.startUtc);
    const end = new Date(body.endUtc);
    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 240 || start.getTime() <= Date.now()) return json({ error: "Invalid booking time." }, 400);

    await admin.from("bookings").update({ status: "cancelled" }).eq("teacher_id", teacher.id).eq("status", "pending").lt("hold_expires_at", new Date().toISOString());

    const amountCents = Math.round(Number(teacher.hourly_rate) * durationMinutes / 60 * 100);
    if (!Number.isInteger(amountCents) || amountCents < 100) return json({ error: "This lesson price is not available." }, 400);
    const platformFeeCents = Math.round(amountCents * 0.2);
    const teacherPayoutCents = amountCents - platformFeeCents;
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: booking, error: bookingError } = await admin.from("bookings").insert({
      student_id: user.id,
      teacher_id: teacher.id,
      start_time_utc: start.toISOString(),
      end_time_utc: end.toISOString(),
      status: "pending",
      hold_expires_at: holdExpiresAt,
      amount_cents: amountCents,
      platform_fee_cents: platformFeeCents,
      teacher_payout_cents: teacherPayoutCents,
    }).select("id").maybeSingle();
    if (bookingError || !booking) return json({ error: "That slot is no longer available." }, 409);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-07-30.basil" });
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price_data: { currency: "usd", product_data: { name: "Language lesson" }, unit_amount: amountCents }, quantity: 1 }],
        payment_intent_data: { metadata: { booking_id: booking.id } },
        metadata: { booking_id: booking.id },
        expires_at: Math.floor((Date.now() + 15 * 60 * 1000) / 1000),
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/teachers/${teacher.id}?payment=cancelled`,
      });
    } catch (stripeError) {
      console.error("checkout session creation failed", stripeError);
      await admin.from("bookings").update({ status: "cancelled" }).eq("id", booking.id).eq("status", "pending");
      return json({ error: "We couldn’t start checkout. Please try again." }, 502);
    }

    const { error: updateError } = await admin.from("bookings").update({ checkout_session_id: session.id }).eq("id", booking.id).eq("status", "pending");
    if (updateError) {
      console.error("booking checkout session update failed", updateError);
      await admin.from("bookings").update({ status: "cancelled" }).eq("id", booking.id).eq("status", "pending");
      return json({ error: "We couldn’t start checkout. Please try again." }, 502);
    }
    return json({ checkoutUrl: session.url }, 200);
  } catch (error) {
    console.error("create checkout session failed", error);
    return json({ error: "We couldn’t start checkout. Please try again." }, 500);
  }
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
