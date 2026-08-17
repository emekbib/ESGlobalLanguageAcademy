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
    const url = Deno.env.get("SUPABASE_URL")!;
    const authClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: "Sign in required." }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: teacher, error: teacherError } = await admin.from("teacher_profiles").select("id, stripe_account_id, stripe_onboarding_complete").eq("user_id", user.id).maybeSingle();
    if (teacherError || !teacher) return json({ error: "Teacher profile not found." }, 404);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-07-30.basil" });
    let accountId = teacher.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express", email: user.email, capabilities: { transfers: { requested: true } }, metadata: { teacher_profile_id: teacher.id, user_id: user.id } });
      accountId = account.id;
      const { error } = await admin.from("teacher_profiles").update({ stripe_account_id: accountId, stripe_onboarding_complete: false }).eq("id", teacher.id);
      if (error) return json({ error: "We couldn’t save your payout account." }, 500);
    }
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const link = await stripe.accountLinks.create({ account: accountId, type: "account_onboarding", refresh_url: `${origin}/teacher/dashboard?connect=retry`, return_url: `${origin}/teacher/dashboard?connect=complete` });
    return json({ onboardingUrl: link.url }, 200);
  } catch (error) {
    console.error("connect onboarding failed", error);
    return json({ error: "We couldn’t open payout setup. Please try again." }, 500);
  }
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
