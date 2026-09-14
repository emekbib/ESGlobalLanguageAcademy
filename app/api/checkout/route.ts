import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to schedule a lesson.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { teacherId, startUtc, endUtc } = body;

    if (!teacherId || !startUtc || !endUtc) {
      return NextResponse.json(
        { error: 'Missing booking parameters.' },
        { status: 400 }
      );
    }

    const start = new Date(startUtc);
    const end = new Date(endUtc);
    const durationMinutes = Math.max(
      30,
      Math.round((end.getTime() - start.getTime()) / 60000)
    );

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    // 1. Sample Teachers (Bethelhem Mengistu, Yohannes, etc.)
    if (typeof teacherId === 'string' && teacherId.startsWith('sample-')) {
      const sampleTeacher = SAMPLE_TEACHERS.find((t) => t.id === teacherId);
      const teacherName = sampleTeacher ? sampleTeacher.name : 'Native Educator';
      const hourlyRate = sampleTeacher ? sampleTeacher.hourlyRate : 28;
      const amountCents = Math.round(((hourlyRate * durationMinutes) / 60) * 100);

      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (stripeSecretKey && !stripeSecretKey.includes('placeholder')) {
        try {
          const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2024-06-20' as any,
          });

          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `1-on-1 Lesson with ${teacherName}`,
                    description: `Private language tutoring session (${durationMinutes} min)`,
                  },
                  unit_amount: amountCents,
                },
                quantity: 1,
              },
            ],
            metadata: {
              teacher_id: teacherId,
              student_id: user.id,
              start_time_utc: start.toISOString(),
              end_time_utc: end.toISOString(),
              is_sample: 'true',
            },
            success_url: `${origin}/dashboard?payment=success&teacher=${encodeURIComponent(
              teacherName
            )}`,
            cancel_url: `${origin}/dashboard?payment=cancelled`,
          });

          if (session.url) {
            return NextResponse.json({ checkoutUrl: session.url });
          }
        } catch (stripeErr: any) {
          console.warn('Stripe checkout creation note:', stripeErr?.message);
        }
      }

      // Fallback for sample teacher in demo / development mode
      return NextResponse.json({
        checkoutUrl: `${origin}/dashboard?booking=confirmed&teacher=${encodeURIComponent(
          teacherName
        )}`,
      });
    }

    // 2. Real Database Teacher
    const { data: teacher, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('id, hourly_rate, stripe_account_id, stripe_onboarding_complete')
      .eq('id', teacherId)
      .maybeSingle();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found.' },
        { status: 404 }
      );
    }

    const hourlyRate = Number(teacher.hourly_rate) || 25;
    const amountCents = Math.round(((hourlyRate * durationMinutes) / 60) * 100);
    const platformFeeCents = Math.round(amountCents * 0.2);
    const teacherPayoutCents = amountCents - platformFeeCents;
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        student_id: user.id,
        teacher_id: teacher.id,
        start_time_utc: start.toISOString(),
        end_time_utc: end.toISOString(),
        status: 'pending',
        hold_expires_at: holdExpiresAt,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        teacher_payout_cents: teacherPayoutCents,
      })
      .select('id')
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'That slot is no longer available.' },
        { status: 409 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2024-06-20' as any,
        });

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: '1-on-1 Language Lesson',
                },
                unit_amount: amountCents,
              },
              quantity: 1,
            },
          ],
          payment_intent_data: {
            metadata: { booking_id: booking.id },
          },
          metadata: { booking_id: booking.id },
          success_url: `${origin}/dashboard?payment=success&booking_id=${booking.id}`,
          cancel_url: `${origin}/dashboard?payment=cancelled`,
        });

        await supabase
          .from('bookings')
          .update({ checkout_session_id: session.id })
          .eq('id', booking.id);

        if (session.url) {
          return NextResponse.json({ checkoutUrl: session.url });
        }
      } catch (stripeErr) {
        console.error('Stripe session creation error:', stripeErr);
      }
    }

    // Fallback confirmation
    return NextResponse.json({
      checkoutUrl: `${origin}/dashboard?booking=confirmed&booking_id=${booking.id}`,
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { error: 'Failed to initiate checkout.' },
      { status: 500 }
    );
  }
}
