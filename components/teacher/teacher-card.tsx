import Link from 'next/link';
import { Star, BadgeCheck } from 'lucide-react';

export type TeacherCardData = {
  id: string;
  name: string;
  avatarUrl: string | null;
  languages: string[];
  rating: number;
  lessonsTaught: number;
  hourlyRate: number;
  teacherType: 'professional' | 'community_tutor';
  specialties?: string[];
  headline?: string;
  countryFlag?: string;
};

export default function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const avg = teacher.rating > 0 ? teacher.rating.toFixed(1) : '5.0';

  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xl"
    >
      {/* Intro.co Natural Portrait Photo */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        {teacher.avatarUrl ? (
          <img
            src={teacher.avatarUrl}
            alt={teacher.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-950 text-5xl font-black text-amber-300">
            {teacher.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Small "Top Teacher" badge at bottom-left inside the photo */}
        {teacher.teacherType === 'professional' && (
          <span className="absolute bottom-3 left-3 rounded-full border border-stone-200/40 dark:border-stone-700/60 bg-white/95 dark:bg-stone-900/95 px-3 py-1 text-[11px] font-bold text-stone-900 dark:text-stone-100 shadow-sm backdrop-blur-md">
            Top Teacher
          </span>
        )}
      </div>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name + verified  |  star + rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="truncate font-display text-base font-bold tracking-tight text-stone-950 dark:text-white group-hover:text-stone-700 dark:group-hover:text-stone-200 transition">
              {teacher.name}
            </h3>
            <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-stone-900 dark:text-stone-200">{avg}</span>
          </div>
        </div>

        {/* Price */}
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
          <span className="font-bold text-stone-900 dark:text-white text-sm">${teacher.hourlyRate}</span>
          {' '}· 50 min session
        </p>

        {/* Headline / bio */}
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-stone-500 dark:text-stone-400 font-medium">
          {teacher.headline || `${teacher.languages.join(' & ')} Specialist`}
        </p>

        {/* Language tags */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {teacher.languages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300"
            >
              {lang}
            </span>
          ))}
          {teacher.languages.length > 3 && (
            <span className="rounded-full bg-stone-50 dark:bg-stone-800/60 px-2 py-0.5 text-[11px] font-semibold text-stone-400 dark:text-stone-500">
              +{teacher.languages.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
