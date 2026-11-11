import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { SAMPLE_TEACHERS } from '@/lib/data/sample-teachers';

function getClients(request: Request, serverClient: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null;

  let userClient = serverClient;
  if (bearerToken) {
    userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${bearerToken}` },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // If service role key is configured, use it for authoritative database operations
  let writeClient = userClient;
  if (serviceRoleKey) {
    writeClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return { userClient, writeClient, bearerToken };
}

export async function POST(req: Request) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { userClient, writeClient } = getClients(req, serverClient);

    // Get user from server cookie client first, fallback to userClient
    let { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      const { data: authData } = await userClient.auth.getUser();
      user = authData?.user ?? null;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to schedule a lesson.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { teacherId, startUtc, endUtc, track, quotedPrice } = body;

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

    // 1. Sample Teachers (Bethelhem Mengistu, Fatuma Hassan, etc.)
    if (typeof teacherId === 'string' && (teacherId.startsWith('sample-') || teacherId.includes('sample'))) {
      const sampleTeacher = SAMPLE_TEACHERS.find((t) => t.id === teacherId);
      const teacherName = sampleTeacher ? sampleTeacher.name : 'Native Educator';
      const teacherAvatar = sampleTeacher ? sampleTeacher.avatarUrl : null;
      const hourlyRate = sampleTeacher ? sampleTeacher.hourlyRate : 28;
      const amountCents = quotedPrice
        ? Math.round(Number(quotedPrice) * 100)
        : Math.round(((hourlyRate * durationMinutes) / 50) * 100);
      const platformFeeCents = Math.round(amountCents * 0.2);
      const teacherPayoutCents = amountCents - platformFeeCents;

      // Find matching teacher_profile in Supabase ONLY if the educator genuinely matches by name
      let targetTeacherProfileId: string | null = null;
      if (sampleTeacher) {
        const firstName = sampleTeacher.name.split(' ')[0];
        const { data: matchedProfile } = await writeClient
          .from('profiles')
          .select('user_id')
          .ilike('full_name', `%${firstName}%`)
          .limit(1)
          .maybeSingle();

        if (matchedProfile) {
          const { data: tp } = await writeClient
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', matchedProfile.user_id)
            .maybeSingle();
          if (tp) targetTeacherProfileId = tp.id;
        }
      }

      const generatedId = `bk_sample_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      let bookingId: string = generatedId;

      if (targetTeacherProfileId) {
        try {
          const { data: bookingRecord, error: insertError } = await writeClient
            .from('bookings')
            .insert({
              student_id: user.id,
              teacher_id: targetTeacherProfileId,
              start_time_utc: start.toISOString(),
              end_time_utc: end.toISOString(),
              status: 'confirmed',
              amount_cents: amountCents,
              platform_fee_cents: platformFeeCents,
              teacher_payout_cents: teacherPayoutCents,
            })
            .select('id, amount_cents')
            .maybeSingle();

          if (bookingRecord) {
            bookingId = bookingRecord.id;
          } else if (insertError) {
            console.warn('Booking insertion notice (sample):', insertError.message);
          }
        } catch (err: any) {
          console.warn('Booking insertion notice:', err?.message || err);
        }
      }

      const confirmedBookingPayload = {
        id: bookingId,
        student_id: user.id,
        teacher_id: targetTeacherProfileId || teacherId,
        teacher_name: teacherName,
        teacher_avatar: teacherAvatar,
        start_time_utc: start.toISOString(),
        end_time_utc: end.toISOString(),
        status: 'confirmed',
        amount_cents: amountCents,
        track: track || 'track_1',
        created_at: new Date().toISOString(),
      };

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
              teacher_id: targetTeacherProfileId || teacherId,
              student_id: user.id,
              booking_id: bookingId,
              start_time_utc: start.toISOString(),
              end_time_utc: end.toISOString(),
              is_sample: 'true',
            },
            success_url: `${origin}/dashboard?payment=success&teacher=${encodeURIComponent(
              teacherName
            )}&booking_id=${bookingId}`,
            cancel_url: `${origin}/dashboard?payment=cancelled`,
          });

          if (session.url) {
            return NextResponse.json({
              checkoutUrl: session.url,
              booking: confirmedBookingPayload,
            });
          }
        } catch (stripeErr: any) {
          console.warn('Stripe checkout creation note:', stripeErr?.message);
        }
      }

      return NextResponse.json({
        checkoutUrl: `${origin}/dashboard?booking=confirmed&teacher=${encodeURIComponent(
          teacherName
        )}&booking_id=${bookingId}`,
        booking: confirmedBookingPayload,
      });
    }

    // 2. Real Database Teacher
    let { data: teacher } = await writeClient
      .from('teacher_profiles')
      .select('id, user_id, hourly_rate, stripe_account_id, stripe_onboarding_complete')
      .eq('id', teacherId)
      .maybeSingle();

    if (!teacher) {
      const { data: tByUserId } = await writeClient
        .from('teacher_profiles')
        .select('id, user_id, hourly_rate, stripe_account_id, stripe_onboarding_complete')
        .eq('user_id', teacherId)
        .maybeSingle();
      teacher = tByUserId;
    }

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found.' },
        { status: 404 }
      );
    }

    // Fetch teacher's name and avatar
    const { data: teacherUser } = await writeClient
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', teacher.user_id)
      .maybeSingle();

    const teacherName = teacherUser?.full_name || 'Native Educator';
    const teacherAvatar = teacherUser?.avatar_url || null;

    const hourlyRate = Number(teacher.hourly_rate) || 35;
    const amountCents = quotedPrice
      ? Math.round(Number(quotedPrice) * 100)
      : Math.round(((hourlyRate * durationMinutes) / 50) * 100);
    const platformFeeCents = Math.round(amountCents * 0.2);
    const teacherPayoutCents = amountCents - platformFeeCents;
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let bookingId: string = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    let bookingCreated = false;

    const { data: booking, error: bookingError } = await writeClient
      .from('bookings')
      .insert({
        student_id: user.id,
        teacher_id: teacher.id,
        start_time_utc: start.toISOString(),
        end_time_utc: end.toISOString(),
        status: 'confirmed',
        hold_expires_at: holdExpiresAt,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        teacher_payout_cents: teacherPayoutCents,
      })
      .select('id, amount_cents')
      .maybeSingle();

    if (booking?.id) {
      bookingId = booking.id;
      bookingCreated = true;
    } else if (bookingError) {
      console.error('Booking insertion failure:', bookingError);
      return NextResponse.json(
        {
          error: bookingError.message.includes('permission denied')
            ? 'Booking permission check failed. Database permissions must be granted to save bookings.'
            : bookingError.message || 'Slot could not be booked in database.',
        },
        { status: 400 }
      );
    }

    const confirmedBookingPayload = {
      id: bookingId,
      student_id: user.id,
      teacher_id: teacher.id,
      teacher_name: teacherName,
      teacher_avatar: teacherAvatar,
      start_time_utc: start.toISOString(),
      end_time_utc: end.toISOString(),
      status: 'confirmed',
      amount_cents: amountCents,
      track: track || 'track_1',
      created_at: new Date().toISOString(),
    };

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
          payment_intent_data: {
            metadata: { booking_id: bookingId },
          },
          metadata: { booking_id: bookingId },
          success_url: `${origin}/dashboard?payment=success&teacher=${encodeURIComponent(
            teacherName
          )}&booking_id=${bookingId}`,
          cancel_url: `${origin}/dashboard?payment=cancelled`,
        });

        if (bookingCreated) {
          try {
            await writeClient
              .from('bookings')
              .update({ checkout_session_id: session.id })
              .eq('id', bookingId);
          } catch {}
        }

        if (session.url) {
          return NextResponse.json({
            checkoutUrl: session.url,
            booking: confirmedBookingPayload,
          });
        }
      } catch (stripeErr) {
        console.error('Stripe session creation error:', stripeErr);
      }
    }

    // Direct confirmation fallback so the lesson appears immediately in student's dashboard
    return NextResponse.json({
      checkoutUrl: `${origin}/dashboard?booking=confirmed&teacher=${encodeURIComponent(
        teacherName
      )}&booking_id=${bookingId}`,
      booking: confirmedBookingPayload,
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to initiate checkout.' },
      { status: 500 }
    );
  }
}
