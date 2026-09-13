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
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl"
    >
      {/* Clean photo — no overlay, no gradient */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        {teacher.avatarUrl ? (
          <img
            src={teacher.avatarUrl}
            alt={teacher.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-6xl font-bold text-stone-300">
            {teacher.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Small "Top Teacher" badge at bottom-left inside the photo */}
        {teacher.teacherType === 'professional' && (
          <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-900 backdrop-blur-sm">
            Top Teacher
          </span>
        )}
      </div>

      {/* Card info — all below the photo */}
      <div className="flex flex-1 flex-col p-4">
        {/* Name + verified  |  star + rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-[15px] font-bold tracking-tight text-stone-900">
              {teacher.name}
            </h3>
            <BadgeCheck className="h-4 w-4 text-sky-500" />
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-stone-800">{avg}</span>
          </div>
        </div>

        {/* Price */}
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-semibold text-stone-800">${teacher.hourlyRate}</span>
          {' '}· Session
        </p>

        {/* Headline / bio */}
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500">
          {teacher.headline || `${teacher.languages.join(' & ')} Specialist`}
        </p>

        {/* Language tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {teacher.languages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600"
            >
              {lang}
            </span>
          ))}
          {teacher.languages.length > 3 && (
            <span className="rounded-full bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-400">
              +{teacher.languages.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
