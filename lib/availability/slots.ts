import type { TeacherAvailability } from '@/lib/types/database';

export type AvailabilitySlot = {
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
  dayLocal: string;
  dateKey: string; // YYYY-MM-DD in viewer timezone
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
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timeZone || 'UTC' }).format(date);
}

export function formatDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timeZone || 'UTC' }).format(date);
}

export function formatDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

export function generateSlots(
  availability: TeacherAvailability[],
  viewerTimezone: string,
  lessonMinutes = 50,
  daysAhead = 14,
  bookings: Booking[] = [],
  now = new Date(),
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const safeViewerTz = viewerTimezone || 'UTC';

  // Ensure default availability if teacher has not added windows yet
  const effectiveAvail: TeacherAvailability[] =
    availability && availability.length > 0
      ? availability
      : [1, 2, 3, 4, 5].map((d) => ({
          id: `default-${d}`,
          teacher_id: 'default',
          weekday: d,
          start_time: '09:00:00',
          end_time: '17:00:00',
          timezone: safeViewerTz,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < daysAhead; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    for (const window of effectiveAvail) {
      const windowTz = window.timezone || safeViewerTz || 'UTC';
      const windowWeekdayInTz = getWeekdayInTimezone(date, windowTz);
      if (windowWeekdayInTz !== window.weekday) continue;

      const { startUtc, endUtc } = windowToUtc(date, window, windowTz);
      if (!startUtc || !endUtc) continue;

      let cursor = new Date(startUtc);
      const windowEnd = new Date(endUtc);

      while (cursor < windowEnd) {
        const slotEnd = new Date(cursor.getTime() + lessonMinutes * 60000);
        if (slotEnd > windowEnd) break;

        // Allow slots at least 15 minutes into future
        if (cursor.getTime() >= now.getTime() - 5 * 60 * 1000) {
          const slotStartIso = cursor.toISOString();
          const slotEndIso = slotEnd.toISOString();
          const isBooked = bookings.some(
            (b) => b.startUtc === slotStartIso || (b.startUtc < slotEndIso && b.endUtc > slotStartIso),
          );
          if (!isBooked) {
            slots.push({
              startUtc: slotStartIso,
              endUtc: slotEndIso,
              startLocal: formatTime(cursor, safeViewerTz),
              endLocal: formatTime(slotEnd, safeViewerTz),
              dayLocal: formatDay(cursor, safeViewerTz),
              dateKey: formatDateKey(cursor, safeViewerTz),
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
  const parts = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: timezone || 'UTC' }).formatToParts(date);
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekdayStr] ?? -1;
}

function windowToUtc(date: Date, window: TeacherAvailability, timezone: string): { startUtc: Date | null; endUtc: Date | null } {
  try {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const [sh, sm] = (window.start_time || '09:00').split(':').map(Number);
    const [eh, em] = (window.end_time || '17:00').split(':').map(Number);

    const startStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`;
    const endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`;

    const startUtc = toUtcFromTimezone(startStr, timezone);
    const endUtc = toUtcFromTimezone(endStr, timezone);
    return { startUtc, endUtc };
  } catch {
    return { startUtc: null, endUtc: null };
  }
}

function toUtcFromTimezone(dateStr: string, timezone: string): Date | null {
  try {
    const [datePart, timePart] = dateStr.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [h, min] = timePart.split(':').map(Number);
    const assumedUtc = Date.UTC(y, m - 1, d, h, min, 0);
    const invDate = new Date(assumedUtc);
    const tzParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(invDate);

    const getPart = (type: string) => Number(tzParts.find((p) => p.type === type)?.value);
    const tzYear = getPart('year');
    const tzMonth = getPart('month');
    const tzDay = getPart('day');
    const tzHour = getPart('hour');
    const tzMin = getPart('minute');
    const tzSec = getPart('second');

    const tzAssumed = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, tzSec);
    const diff = tzAssumed - assumedUtc;
    return new Date(assumedUtc - diff);
  } catch {
    return null;
  }
}
