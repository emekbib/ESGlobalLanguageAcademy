import { NextResponse } from 'next/server';
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

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking ID.' },
        { status: 400 }
      );
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, student_id, teacher_id, start_time_utc, end_time_utc, daily_room_url, status')
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Lesson booking not found.' },
        { status: 404 }
      );
    }

    // Verify calling user is either student or teacher
    let isTeacher = false;
    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('user_id')
      .eq('id', booking.teacher_id)
      .maybeSingle();

    if (teacher && teacher.user_id === user.id) {
      isTeacher = true;
    }

    if (booking.student_id !== user.id && !isTeacher) {
      return NextResponse.json(
        { error: 'You do not have access to this virtual classroom.' },
        { status: 403 }
      );
    }

    const dailyApiKey = process.env.DAILY_API_KEY;
    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Daily.co API key is not configured.' },
        { status: 500 }
      );
    }

    // Fetch caller's display name for classroom participant badge
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();
    const userName = callerProfile?.full_name || (isTeacher ? 'Educator' : 'Student');

    const start = new Date(booking.start_time_utc);
    const end = new Date(booking.end_time_utc);
    const nbf = Math.floor(start.getTime() / 1000) - 15 * 60; // 15 mins before
    const exp = Math.floor(end.getTime() / 1000) + 90 * 60; // 90 mins after

    const roomName = `esglobal-${booking.id.replace(/-/g, '').slice(0, 16)}`;
    let roomUrl: string | null = booking.daily_room_url || null;

    // 1. Create or retrieve private Daily.co room if not already stored
    if (!roomUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${dailyApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            name: roomName,
            privacy: 'private', // Enforces meeting-token authentication
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

        clearTimeout(timeoutId);

        if (res.ok) {
          const roomData = await res.json();
          roomUrl = roomData.url;
        } else {
          const errorText = await res.text();
          console.warn('Daily.co room creation warning:', res.status, errorText);
          if (errorText.includes('already exists')) {
            const fetchExisting = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
              headers: { Authorization: `Bearer ${dailyApiKey}` },
            });
            if (fetchExisting.ok) {
              const existingData = await fetchExisting.json();
              roomUrl = existingData?.url || null;
            }
          }
        }
      } catch (networkErr: any) {
        console.warn('Daily.co network unreachable, using resilient classroom room URL:', networkErr?.message);
      }

      // Fallback to predictable Daily.co room link if remote API had a network timeout
      if (!roomUrl) {
        roomUrl = `https://esglobal.daily.co/${roomName}`;
      }

      // Persist base room URL to bookings table
      await supabase
        .from('bookings')
        .update({ daily_room_url: roomUrl })
        .eq('id', booking.id);
    }

    // 2. Issue a secure, short-lived meeting token for the authenticated caller
    let tokenizedUrl = roomUrl;
    try {
      const tokenController = new AbortController();
      const tokenTimeoutId = setTimeout(() => tokenController.abort(), 4000);

      const tokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${dailyApiKey}`,
          'Content-Type': 'application/json',
        },
        signal: tokenController.signal,
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_name: userName,
            user_id: user.id,
            is_owner: isTeacher,
            nbf,
            exp,
          },
        }),
      });

      clearTimeout(tokenTimeoutId);

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData?.token) {
          tokenizedUrl = `${roomUrl}?t=${tokenData.token}`;
        }
      }
    } catch (tokenErr) {
      console.warn('Daily.co meeting token generation skipped due to network timeout:', tokenErr);
    }

    return NextResponse.json({ url: tokenizedUrl });
  } catch (err: any) {
    console.error('Classroom room creation error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
