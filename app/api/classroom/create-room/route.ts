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

    // If room already generated, return existing URL
    if (booking.daily_room_url) {
      return NextResponse.json({ url: booking.daily_room_url });
    }

    const dailyApiKey = process.env.DAILY_API_KEY;
    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Daily.co API key is not configured.' },
        { status: 500 }
      );
    }

    const start = new Date(booking.start_time_utc);
    const end = new Date(booking.end_time_utc);
    const nbf = Math.floor(start.getTime() / 1000) - 15 * 60; // 15 mins before
    const exp = Math.floor(end.getTime() / 1000) + 90 * 60; // 90 mins after

    const roomName = `esglobal-${booking.id.replace(/-/g, '').slice(0, 16)}`;

    const res = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public', // Accessible with secure room link
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
      const errorText = await res.text();
      console.error('Daily.co room creation failed:', res.status, errorText);
      // If room already exists with that name, fetch it
      if (errorText.includes('already exists')) {
        const fetchExisting = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
          headers: { Authorization: `Bearer ${dailyApiKey}` },
        });
        if (fetchExisting.ok) {
          const existingData = await fetchExisting.json();
          if (existingData?.url) {
            await supabase
              .from('bookings')
              .update({ daily_room_url: existingData.url })
              .eq('id', booking.id);
            return NextResponse.json({ url: existingData.url });
          }
        }
      }
      return NextResponse.json(
        { error: 'Could not create virtual classroom room.' },
        { status: 502 }
      );
    }

    const roomData = await res.json();
    const roomUrl = roomData.url;

    if (!roomUrl) {
      return NextResponse.json(
        { error: 'Daily.co returned an invalid room URL.' },
        { status: 502 }
      );
    }

    // Persist to bookings table
    await supabase
      .from('bookings')
      .update({ daily_room_url: roomUrl })
      .eq('id', booking.id);

    return NextResponse.json({ url: roomUrl });
  } catch (err: any) {
    console.error('Classroom room creation error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
