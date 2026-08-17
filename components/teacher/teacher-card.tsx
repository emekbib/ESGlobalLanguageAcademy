import Link from 'next/link';
import { Star } from 'lucide-react';

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
};

const BADGE_LABEL: Record<TeacherCardData['teacherType'], string> = {
  professional: 'Professional Teacher',
  community_tutor: 'Community Tutor',
};

export default function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const avg = teacher.rating;

  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {teacher.avatarUrl ? (
          <img
            src={teacher.avatarUrl}
            alt={teacher.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15 text-5xl font-bold text-primary/40">
            {teacher.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-accent" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 inline-flex w-fit items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          <Star className="h-3 w-3 fill-accent text-accent" />
          {BADGE_LABEL[teacher.teacherType]}
        </span>

        <h3 className="font-display text-lg font-semibold">{teacher.name}</h3>

        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          {teacher.rating > 0 ? (
            <>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
              <span>· {teacher.lessonsTaught.toLocaleString()} lessons</span>
            </>
          ) : (
            <span>{teacher.lessonsTaught.toLocaleString()} lessons taught</span>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {teacher.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {lang}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <p className="text-sm font-semibold">
            From <span className="text-primary">${teacher.hourlyRate}/hr</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
