import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Fetch teacher profile
    const { data: teacher, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('id, stripe_account_id, stripe_onboarding_complete')
      .eq('user_id', user.id)
      .maybeSingle();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Educator profile not found. Please complete your profile details first.' },
        { status: 404 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // 1. Simulation action for local testing / demo mode (strictly forbidden in production)
    if (body?.action === 'simulate' || body?.simulate === true) {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_STRIPE_SIMULATION !== 'true') {
        return NextResponse.json(
          { error: 'Simulated payout verification is disabled in production. Real Stripe Express onboarding is required.' },
          { status: 403 }
        );
      }

      const mockAccountId = `acct_sim_${teacher.id.replace(/-/g, '').slice(0, 16)}`;
      const { error: updateErr } = await supabase
        .from('teacher_profiles')
        .update({
          stripe_account_id: mockAccountId,
          stripe_onboarding_complete: true,
        })
        .eq('id', teacher.id);

      if (updateErr) {
        return NextResponse.json(
          { error: updateErr.message || 'Failed to update payout status.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        simulated: true,
        stripe_account_id: mockAccountId,
      });
    }

    // 2. Disconnect action for reset
    if (body?.action === 'disconnect') {
      await supabase
        .from('teacher_profiles')
        .update({
          stripe_account_id: null,
          stripe_onboarding_complete: false,
        })
        .eq('id', teacher.id);

      return NextResponse.json({ success: true, disconnected: true });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe secret key is not configured.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20' as any,
    });

    let accountId = teacher.stripe_account_id;

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    try {
      if (!accountId || accountId.startsWith('acct_sim_')) {
        // Create an Express Connect account
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          capabilities: {
            transfers: { requested: true },
          },
          metadata: {
            teacher_profile_id: teacher.id,
            user_id: user.id,
          },
        });

        accountId = account.id;

        await supabase
          .from('teacher_profiles')
          .update({
            stripe_account_id: accountId,
            stripe_onboarding_complete: false,
          })
          .eq('id', teacher.id);
      }

      // Create an Account Link for Stripe Express onboarding
      const link = await stripe.accountLinks.create({
        account: accountId,
        type: 'account_onboarding',
        refresh_url: `${origin}/teacher/dashboard?connect=retry`,
        return_url: `${origin}/teacher/dashboard?connect=complete`,
      });

      return NextResponse.json({ onboardingUrl: link.url }, { status: 200 });
    } catch (stripeErr: any) {
      console.error('Stripe Connect error:', stripeErr);

      // If key is restricted without connected_account_write permission:
      if (
        stripeErr?.message?.includes('Permission denied') ||
        stripeErr?.message?.includes('connected_account_write')
      ) {
        return NextResponse.json(
          {
            error:
              'Stripe Key Permission: The test key in .env.local needs "Accounts Write" (connected_account_write) permission enabled in the Stripe Dashboard to generate live Express onboarding links.',
            permissionRequired: true,
            canSimulate: true,
          },
          { status: 400 }
        );
      }

      // If the existing account was deleted or invalid in test mode:
      if (
        accountId &&
        (stripeErr?.code === 'resource_missing' ||
          stripeErr?.message?.includes('No such account'))
      ) {
        const freshAccount = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          capabilities: {
            transfers: { requested: true },
          },
          metadata: {
            teacher_profile_id: teacher.id,
            user_id: user.id,
          },
        });

        await supabase
          .from('teacher_profiles')
          .update({
            stripe_account_id: freshAccount.id,
            stripe_onboarding_complete: false,
          })
          .eq('id', teacher.id);

        const link = await stripe.accountLinks.create({
          account: freshAccount.id,
          type: 'account_onboarding',
          refresh_url: `${origin}/teacher/dashboard?connect=retry`,
          return_url: `${origin}/teacher/dashboard?connect=complete`,
        });

        return NextResponse.json({ onboardingUrl: link.url }, { status: 200 });
      }

      return NextResponse.json(
        {
          error: stripeErr?.message || 'Failed to initialize Stripe Express onboarding.',
          canSimulate: true,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error('Connect route error:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
