import type { TeacherAvailability } from '@/lib/types/database';

export type AvailabilitySlot = {
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
  dayLocal: string;
  weekdayLocal: number;
};

export type Booking = {
  startUtc: string;
  endUtc: string;
};

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function weekdayName(weekday: number): string {
  return WEEKDAY_NAMES[weekday] ?? '';
}

export function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone }).format(date);
}

export function formatDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone }).format(date);
}

export function generateSlots(
  availability: TeacherAvailability[],
  viewerTimezone: string,
  lessonMinutes = 60,
  daysAhead = 14,
  bookings: Booking[] = [],
  now = new Date(),
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < daysAhead; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    for (const window of availability) {
      const windowWeekdayInTz = getWeekdayInTimezone(date, window.timezone);
      if (windowWeekdayInTz !== window.weekday) continue;

      const { startUtc, endUtc } = windowToUtc(date, window);
      if (!startUtc || !endUtc) continue;

      let cursor = new Date(startUtc);
      const windowEnd = new Date(endUtc);

      while (cursor < windowEnd) {
        const slotEnd = new Date(cursor.getTime() + lessonMinutes * 60000);
        if (slotEnd > windowEnd) break;

        if (cursor >= now) {
          const slotStartIso = cursor.toISOString();
          const slotEndIso = slotEnd.toISOString();
          const isBooked = bookings.some(
            (b) => b.startUtc === slotStartIso || (b.startUtc < slotEndIso && b.endUtc > slotStartIso),
          );
          if (!isBooked) {
            slots.push({
              startUtc: slotStartIso,
              endUtc: slotEndIso,
              startLocal: formatTime(cursor, viewerTimezone),
              endLocal: formatTime(slotEnd, viewerTimezone),
              dayLocal: formatDay(cursor, viewerTimezone),
              weekdayLocal: cursor.getUTCDay(),
            });
          }
        }
        cursor = slotEnd;
      }
    }
  }

  return slots;
}

function getWeekdayInTimezone(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: timezone }).formatToParts(date);
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekdayStr] ?? -1;
}

function windowToUtc(date: Date, window: TeacherAvailability): { startUtc: Date | null; endUtc: Date | null } {
  try {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const [sh, sm] = window.start_time.split(':').map(Number);
    const [eh, em] = window.end_time.split(':').map(Number);

    const startStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`;
    const endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`;

    const startUtc = toUtcFromTimezone(startStr, window.timezone);
    const endUtc = toUtcFromTimezone(endStr, window.timezone);
    return { startUtc, endUtc };
  } catch {
    return { startUtc: null, endUtc: null };
  }
}

function toUtcFromTimezone(localDateTimeStr: string, timezone: string): Date | null {
  try {
    const dt = new Date(localDateTimeStr);
    const utcDate = new Date(dt.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(dt.toLocaleString('en-US', { timeZone: timezone }));
    const offset = utcDate.getTime() - tzDate.getTime();
    return new Date(dt.getTime() - offset);
  } catch {
    return null;
  }
}
