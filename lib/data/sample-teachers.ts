import type { TeacherCardData } from '@/components/teacher/teacher-card';
import type { Review } from '@/components/teacher/reviews-section';

export type SampleTeacherDetail = TeacherCardData & {
  bio: string;
  languages_spoken: string[];
  video_intro_url?: string;
  education?: string[];
  reviews: Review[];
  availableSlots?: {
    dayOfWeek: number; // 0-6
    startTime: string; // '09:00'
    endTime: string; // '17:00'
  }[];
};

export const SAMPLE_TEACHERS: SampleTeacherDetail[] = [
  {
    id: 'sample-1',
    name: 'Bethelhem Mengistu',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop',
    languages: ['Amharic'],
    rating: 4.99,
    lessonsTaught: 1850,
    hourlyRate: 35,
    teacherType: 'professional',
    headline: 'Addis Ababa University Alum · Fidel Script & Conversational Amharic',
    bio: `Selam! I am Bethelhem, a native Amharic educator born and raised in Addis Ababa. I hold a Bachelor's Degree in Linguistics from Addis Ababa University and have spent the last 6 years teaching Amharic to diaspora Ethiopians, expats, diplomatic professionals, and language enthusiasts worldwide.

My teaching method focuses on rapid conversational fluency through immersion, cultural storytelling, and practical dialogue. Whether you want to master the Ge'ez / Fidel script, practice speaking with your relatives, or prepare for business in Ethiopia, our lessons will be structured, patient, and thoroughly engaging.`,
    languages_spoken: ['Amharic (Native)', 'English (Fluent)'],
    specialties: ['Fidel Script', 'Conversational Amharic', 'Grammar & Culture', 'Diaspora Children'],
    video_intro_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    education: [
      'BA in Linguistics — Addis Ababa University',
      'Certificate in Teaching Amharic as a Second Language (TASL)',
    ],
    reviews: [
      {
        id: 'rev-1',
        rating: 5,
        comment: 'Bethelhem is an incredible teacher! She made learning the Fidel script so intuitive. After just 5 lessons I was able to read Ethiopian signs and menus.',
        createdAt: '2026-08-20T10:00:00Z',
        studentName: 'Yohannes Tadesse',
      },
      {
        id: 'rev-2',
        rating: 5,
        comment: 'Patient, warm, and highly structured. She tailored every session to conversational phrases I needed for my trip to Addis.',
        createdAt: '2026-07-14T15:30:00Z',
        studentName: 'Marcus Vance',
      },
      {
        id: 'rev-3',
        rating: 5,
        comment: 'Best language instructor I have ever worked with. Her explanations of Amharic verb conjugations are crystal clear.',
        createdAt: '2026-06-02T18:45:00Z',
        studentName: 'Elena Rostova',
      },
    ],
  },
  {
    id: 'sample-7',
    name: 'Fatuma Hassan',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    languages: ['Somali'],
    rating: 4.96,
    lessonsTaught: 1100,
    hourlyRate: 28,
    teacherType: 'community_tutor',
    headline: 'Somali Language & Culture Faculty · Somali for Beginners & Healthcare Interpreters',
    bio: `Soo dhowow! I am Fatuma, a native Somali language coach. I work with diaspora students, healthcare professionals, and humanitarian caseworkers to build authentic Somali speaking skills rapidly.`,
    languages_spoken: ['Somali (Native)', 'English (Fluent)'],
    specialties: ['Somali for Beginners', 'Medical Somali Vocabulary', 'Diaspora Reconnection', 'Grammar Basics'],
    video_intro_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-a-video-call-with-her-laptop-42998-large.mp4',
    education: [
      'BA in Social Sciences & Translation Studies — Mogadishu University',
    ],
    reviews: [
      {
        id: 'rev-701',
        rating: 5,
        comment: 'Fatuma is so warm and welcoming. She makes you feel comfortable speaking from lesson one.',
        createdAt: '2026-07-19T17:00:00Z',
        studentName: 'Amina Yusuf',
      },
    ],
  },
  {
    id: 'sample-8',
    name: 'Chaltu Deressa',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    languages: ['Afaan Oromo'],
    rating: 4.94,
    lessonsTaught: 720,
    hourlyRate: 25,
    teacherType: 'community_tutor',
    headline: 'Youth & Diaspora Specialist · Interactive Afaan Oromo Speaking',
    bio: `Akkam! I am Chaltu. I specialize in teaching Afaan Oromo to children, teens, and adults living abroad. My sessions use games, stories, and daily scenarios so learning feels natural and fun.`,
    languages_spoken: ['Afaan Oromo (Native)', 'English (Fluent)'],
    specialties: ['Children & Youth', 'Qubee Basics', 'Family Conversation', 'Oromo Traditions'],
    education: [
      'BEd in Language Teaching — Adama Science and Technology University',
    ],
    reviews: [
      {
        id: 'rev-801',
        rating: 5,
        comment: 'My kids love learning Afaan Oromo with Chaltu. She is incredibly engaging and patient.',
        createdAt: '2026-08-25T14:30:00Z',
        studentName: 'Gamachu Bekele',
      },
    ],
  },
];

export function getSampleTeacherById(id: string): SampleTeacherDetail | undefined {
  return SAMPLE_TEACHERS.find((t) => t.id === id);
}
