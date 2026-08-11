import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "reminders@esgloballanguageacademy.com";
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);

    const { data: bookings24h } = await admin
      .from("bookings")
      .select("id, student_id, teacher_id, start_time_utc, end_time_utc, reminder_24h_sent_at")
      .eq("status", "confirmed")
      .is("reminder_24h_sent_at", null)
      .lte("start_time_utc", in24h.toISOString())
      .gt("start_time_utc", now.toISOString());

    const { data: bookings1h } = await admin
      .from("bookings")
      .select("id, student_id, teacher_id, start_time_utc, end_time_utc, reminder_1h_sent_at")
      .eq("status", "confirmed")
      .is("reminder_1h_sent_at", null)
      .lte("start_time_utc", in1h.toISOString())
      .gt("start_time_utc", now.toISOString());

    const { data: bookingsStartingSoon } = await admin
      .from("bookings")
      .select("id, student_id, teacher_id, start_time_utc, starting_soon_notified_at")
      .eq("status", "confirmed")
      .is("starting_soon_notified_at", null)
      .lte("start_time_utc", in1h.toISOString())
      .gt("start_time_utc", now.toISOString());

    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const booking of (bookings24h ?? [])) {
      const contacts = await getContacts(admin, booking.student_id, booking.teacher_id);
      if (!contacts) { errors.push(`24h booking ${booking.id}: contacts not found`); continue; }
      const timeLabel = formatTime(booking.start_time_utc);
      if (resendKey) {
        const studentErr = await sendEmail(resendKey, fromEmail, contacts.studentEmail, contacts.studentName, "Your lesson starts in 24 hours", `Hi ${contacts.studentName}, your lesson with ${contacts.teacherName} starts in 24 hours at ${timeLabel}.`);
        const teacherErr = await sendEmail(resendKey, fromEmail, contacts.teacherEmail, contacts.teacherName, "You have a lesson in 24 hours", `Hi ${contacts.teacherName}, your lesson with ${contacts.studentName} starts in 24 hours at ${timeLabel}.`);
        if (studentErr || teacherErr) { errors.push(`24h booking ${booking.id}: email send failed`); continue; }
      } else {
        errors.push(`24h booking ${booking.id}: RESEND_API_KEY not set, skipping email`);
      }
      await admin.from("bookings").update({ reminder_24h_sent_at: now.toISOString() }).eq("id", booking.id);
      emailsSent.push(`24h:${booking.id}`);
    }

    for (const booking of (bookings1h ?? [])) {
      const contacts = await getContacts(admin, booking.student_id, booking.teacher_id);
      if (!contacts) { errors.push(`1h booking ${booking.id}: contacts not found`); continue; }
      const timeLabel = formatTime(booking.start_time_utc);
      if (resendKey) {
        const studentErr = await sendEmail(resendKey, fromEmail, contacts.studentEmail, contacts.studentName, "Your lesson starts in 1 hour", `Hi ${contacts.studentName}, your lesson with ${contacts.teacherName} starts in 1 hour at ${timeLabel}. Join from your dashboard.`);
        const teacherErr = await sendEmail(resendKey, fromEmail, contacts.teacherEmail, contacts.teacherName, "You have a lesson in 1 hour", `Hi ${contacts.teacherName}, your lesson with ${contacts.studentName} starts in 1 hour at ${timeLabel}.`);
        if (studentErr || teacherErr) { errors.push(`1h booking ${booking.id}: email send failed`); continue; }
      } else {
        errors.push(`1h booking ${booking.id}: RESEND_API_KEY not set, skipping email`);
      }
      await admin.from("bookings").update({ reminder_1h_sent_at: now.toISOString() }).eq("id", booking.id);
      emailsSent.push(`1h:${booking.id}`);
    }

    for (const booking of (bookingsStartingSoon ?? [])) {
      const teacher = await admin.from("teacher_profiles").select("user_id").eq("id", booking.teacher_id).maybeSingle();
      const timeLabel = formatTime(booking.start_time_utc);
      await admin.from("notifications").insert([
        { user_id: booking.student_id, booking_id: booking.id, type: "starting_soon", message: `Your lesson starts soon at ${timeLabel}. Get ready to join!` },
        ...(teacher.data?.user_id ? [{ user_id: teacher.data.user_id, booking_id: booking.id, type: "starting_soon", message: `Your lesson starts soon at ${timeLabel}.` }] : []),
      ]);
      await admin.from("bookings").update({ starting_soon_notified_at: now.toISOString() }).eq("id", booking.id);
      emailsSent.push(`soon:${booking.id}`);
    }

    return json({ sent: emailsSent, errors: errors.length ? errors : undefined }, 200);
  } catch (error) {
    console.error("send-booking-reminders failed", error);
    return json({ error: "Could not process reminders." }, 500);
  }
});

async function getContacts(admin: ReturnType<typeof createClient>, studentId: string, teacherProfileId: string): Promise<{ studentEmail: string; studentName: string; teacherEmail: string; teacherName: string } | null> {
  const { data: studentAuth } = await admin.auth.admin.getUserById(studentId);
  const { data: studentProfile } = await admin.from("profiles").select("full_name").eq("user_id", studentId).maybeSingle();
  const { data: teacherProfile } = await admin.from("teacher_profiles").select("user_id").eq("id", teacherProfileId).maybeSingle();
  if (!teacherProfile?.user_id) return null;
  const { data: teacherAuth } = await admin.auth.admin.getUserById(teacherProfile.user_id);
  const { data: teacherProfileName } = await admin.from("profiles").select("full_name").eq("user_id", teacherProfile.user_id).maybeSingle();
  if (!studentAuth.data.user?.email || !teacherAuth.data.user?.email) return null;
  return {
    studentEmail: studentAuth.data.user.email,
    studentName: studentProfile?.full_name ?? "Student",
    teacherEmail: teacherAuth.data.user.email,
    teacherName: teacherProfileName?.full_name ?? "Teacher",
  };
}

async function sendEmail(apiKey: string, from: string, to: string, name: string, subject: string, text: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!res.ok) {
      console.error("Resend send failed", res.status, await res.text());
      return `send_failed_${to}`;
    }
    return null;
  } catch (err) {
    console.error("Resend send error", err);
    return `send_error_${to}`;
  }
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(new Date(iso));
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
