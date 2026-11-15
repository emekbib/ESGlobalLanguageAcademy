// Shared utilities for teacher profile resolution and display.

/**
 * Demo/QA name marker check. Returns true ONLY for explicit test-account markers
 * in the name. An empty or missing name does NOT count as demo — the teacher may
 * simply not have set their display name yet.
 */
export function isDemoOrQaName(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase().trim();
  return (
    lower.includes('(teacher demo)') ||
    lower.includes('teacher demo') ||
    lower.startsWith('qa ') ||
    lower.includes('rahel teacher') ||
    lower.includes('demo ') ||
    lower.includes('sample') ||
    lower.startsWith('test ')
  );
}

/**
 * Strips the literal " (Teacher Demo)" suffix from a display name at render time.
 * Does not modify the stored value — the migration handles that separately.
 */
export function stripDemoSuffix(name: string | null | undefined): string {
  if (!name) return '';
  return name.replace(/\s*\(Teacher Demo\)\s*/gi, '').trim();
}

/**
 * From an array of teacher_profiles rows for the same user, pick the canonical one:
 * 1. Prefer is_published=true AND application_status='approved'
 * 2. If none, prefer is_published=true
 * 3. If none, prefer the most recently created row
 * Never silently picks the oldest/demo row.
 */
export function pickCanonicalProfile<T extends {
  id: string;
  is_published: boolean;
  application_status?: string | null;
  created_at: string;
}>(profiles: T[]): T | null {
  if (profiles.length === 0) return null;
  if (profiles.length === 1) return profiles[0];

  const publishedApproved = profiles.filter(
    (p) => p.is_published && (p.application_status === 'approved' || p.application_status == null)
  );
  if (publishedApproved.length > 0) {
    return publishedApproved.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  }

  const published = profiles.filter((p) => p.is_published);
  if (published.length > 0) {
    return published.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  }

  return profiles.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}
