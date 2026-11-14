import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ALLOWED_LESSON_MINUTES, PLATFORM_FEE_RATE, lessonPriceCents } from '@/lib/pricing';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HOLD_MINUTES = 15;

/**
 * Starts a paid booking.
 *
 * Rules (each one fixes a QA finding):
 *  - The price is computed HERE from the teacher's rate and the lesson length. The amount
 *    the client displays is only used to detect a stale quote; it is never charged.
 *  - The booking is created as a 15-minute `pending` hold, never `confirmed`. It becomes
 *    `confirmed` only after Stripe reports the Checkout Session as paid
 *    (see lib/payments/confirm-booking.ts, called from the success redirect).
 *  - If Stripe is unavailable the hold is released and an error is returned. There is
 *    no "free confirmation" fallback.
 *  - Showcase (sample) profiles cannot be booked.
 */
export async function POST(req: Request) {
  let createdBookingId: string | null = null;
  let db: any = null;
  const t0 = Date.now();
  const mark = (step: string) => {
    if (process.env.CHECKOUT_TIMING) console.log(`[checkout] ${step} +${Date.now() - t0}ms`);
  };

  try {
    const serverClient = await createSupabaseServerClient();
    db = serverClient;

    let {
      data: { user },
    } = await serverClient.auth.getUser();

    // Fallback to the bearer token sent by the booking card (cookie edge cases).
    if (!user) {
      const auth = req.headers.get('authorization');
      const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
      if (token) {
        const bearerClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY || '',
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          },
        );
        const { data } = await bearerClient.auth.getUser(token);
        if (data?.user) {
          user = data.user;
          db = bearerClient;
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to book a lesson.' }, { status: 401 });
    }

    mark('auth');
    const body = await req.json();
    mark('body');
    const { teacherId, startUtc, lessonMinutes, quotedPrice } = body ?? {};

    if (typeof teacherId !== 'string' || !UUID_RE.test(teacherId)) {
      return NextResponse.json(
        { error: 'This profile is a preview and is not taking bookings yet.' },
        { status: 400 },
      );
    }

    const minutes = Number(lessonMinutes);
    if (!ALLOWED_LESSON_MINUTES.includes(minutes as any)) {
      return NextResponse.json({ error: 'Please choose a 30, 50, or 60 minute lesson.' }, { status: 400 });
    }

    const start = new Date(startUtc);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
      return NextResponse.json({ error: 'That time is no longer available. Please pick another.' }, { status: 400 });
    }
    const end = new Date(start.getTime() + minutes * 60_000);

    // The booking must belong to a student account.
    const { data: me } = await db.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
    if (!me || me.role !== 'student') {
      return NextResponse.json({ error: 'Only student accounts can book lessons.' }, { status: 403 });
    }

    const { data: teacher } = await db
      .from('teacher_profiles')
      .select('id, user_id, hourly_rate, is_published')
      .eq('id', teacherId)
      .maybeSingle();

    if (!teacher || !teacher.is_published) {
      return NextResponse.json({ error: 'This teacher is not taking bookings right now.' }, { status: 404 });
    }
    if (teacher.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot book a lesson with yourself.' }, { status: 400 });
    }

    // Price is authoritative on the server.
    const amountCents = lessonPriceCents(Number(teacher.hourly_rate), minutes);
    if (quotedPrice != null && Math.round(Number(quotedPrice) * 100) !== amountCents) {
      return NextResponse.json(
        { error: 'This teacher’s price has changed. Please refresh the page to see the current price.' },
        { status: 409 },
      );
    }
    const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_RATE);
    const teacherPayoutCents = amountCents - platformFeeCents;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || stripeSecretKey.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Payments are not configured yet, so lessons cannot be booked. Please contact support.' },
        { status: 503 },
      );
    }

    const { data: teacherUser } = await db
      .from('profiles')
      .select('full_name')
      .eq('user_id', teacher.user_id)
      .maybeSingle();
    const teacherName = teacherUser?.full_name || 'your teacher';

    mark('validated');
    // 1. Reserve the slot as a pending hold. The DB exclusion constraint rejects overlaps.
    const { data: booking, error: bookingError } = await db
      .from('bookings')
      .insert({
        student_id: user.id,
        teacher_id: teacher.id,
        start_time_utc: start.toISOString(),
        end_time_utc: end.toISOString(),
        status: 'pending',
        hold_expires_at: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        teacher_payout_cents: teacherPayoutCents,
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      const overlap =
        bookingError?.code === '23P01' || /overlap|exclusion/i.test(bookingError?.message ?? '');
      return NextResponse.json(
        {
          error: overlap
            ? 'Someone just booked that time. Please choose another slot.'
            : 'We couldn’t reserve that time. Please try again.',
        },
        { status: overlap ? 409 : 400 },
      );
    }
    createdBookingId = booking.id;
    mark('hold-created');

    // 2. Create the Stripe Checkout Session — the student reviews and pays there.
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${minutes}-minute lesson with ${teacherName}`,
              description: `Starts ${start.toUTCString()}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: { booking_id: booking.id, student_id: user.id, teacher_id: teacher.id },
      payment_intent_data: { metadata: { booking_id: booking.id } },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60, // Stripe minimum is 30 min
      success_url: `${origin}/dashboard?payment=success&booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled&booking_id=${booking.id}`,
    });

    mark('stripe-session');
    if (!session.url) throw new Error('Stripe did not return a checkout URL.');

    await db.from('bookings').update({ checkout_session_id: session.id }).eq('id', booking.id);

    return NextResponse.json({
      checkoutUrl: session.url,
      booking: { id: booking.id, amount_cents: amountCents, start_time_utc: start.toISOString() },
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    // Release the hold so the slot isn't blocked by a checkout that never started.
    if (createdBookingId && db) {
      await db.from('bookings').update({ status: 'cancelled' }).eq('id', createdBookingId);
    }
    return NextResponse.json(
      { error: 'We couldn’t start the payment. Your card has not been charged. Please try again.' },
      { status: 500 },
    );
  }
}
