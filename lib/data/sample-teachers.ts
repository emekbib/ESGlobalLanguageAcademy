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
    languages: ['Amharic', 'English'],
    rating: 4.99,
    lessonsTaught: 1850,
    hourlyRate: 28,
    teacherType: 'professional',
    headline: 'Addis Ababa University Alum · Fidel Script & Conversational Amharic',
    bio: `Selam! I am Bethelhem, a native Amharic educator born and raised in Addis Ababa. I hold a Bachelor's Degree in Linguistics from Addis Ababa University and have spent the last 6 years teaching Amharic to diaspora Ethiopians, expats, diplomatic professionals, and language enthusiasts worldwide.

My teaching method focuses on rapid conversational fluency through immersion, cultural storytelling, and practical dialogue. Whether you want to master the Ge'ez / Fidel script, practice speaking with your relatives, or prepare for business in Ethiopia, our lessons will be structured, patient, and thoroughly engaging.`,
    languages_spoken: ['Amharic (Native)', 'English (Fluent)', 'Afan Oromo (Conversational)'],
    specialties: ['Fidel Script', 'Conversational Amharic', 'Grammar & Culture', 'Diaspora Children'],
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
    id: 'sample-2',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1580894732415-0d29661fa25d?q=80&w=800&auto=format&fit=crop',
    languages: ['English'],
    rating: 4.98,
    lessonsTaught: 3100,
    hourlyRate: 35,
    teacherType: 'professional',
    headline: 'Cambridge CELTA Tutor · IELTS Prep & Academic Writing',
    bio: `Hello! I'm Sarah, a certified British English instructor with over 8 years of international teaching experience. I specialize in helping ambitious students achieve band 7.5+ in IELTS, master professional business English, and overcome speaking anxiety.

I have coached students who gained admission to Oxford, Cambridge, and Harvard, as well as professionals working at top tech and consulting firms. My sessions are interactive, rigorous, and completely customized to your personal goals.`,
    languages_spoken: ['English (Native)', 'French (Intermediate)'],
    specialties: ['IELTS 7.5+ Prep', 'Academic Writing', 'Business English', 'Accent Neutralization'],
    education: [
      'Cambridge CELTA (Pass A) — International House London',
      'BA in English Literature — University of Bristol',
    ],
    reviews: [
      {
        id: 'rev-201',
        rating: 5,
        comment: 'Sarah helped me jump from IELTS 6.5 to 8.0 in just two months. Her feedback on task 2 essays is invaluable!',
        createdAt: '2026-08-11T09:00:00Z',
        studentName: 'Dawit Mengesha',
      },
      {
        id: 'rev-202',
        rating: 5,
        comment: 'Clear, direct, and encouraging. She spotted my pronunciation habits immediately and gave me targeted exercises.',
        createdAt: '2026-07-29T14:00:00Z',
        studentName: 'Klara Becker',
      },
    ],
  },
  {
    id: 'sample-3',
    name: 'Hannah Weber',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=800&auto=format&fit=crop',
    languages: ['German', 'English'],
    rating: 4.97,
    lessonsTaught: 1420,
    hourlyRate: 40,
    teacherType: 'professional',
    headline: 'Berlin Educator · Goethe-Zertifikat A1–C1 & Ausbildung Coach',
    bio: `Hallo zusammen! I am Hannah, an experienced German language teacher from Berlin. Over the past 5 years, I have guided hundreds of international students through Goethe-Zertifikat and telc examinations (A1 to C1), as well as preparation for German nursing programs (Ausbildung) and university studies.

German grammar can seem intimidating, but with structured formulas and real-world conversation, you will be surprised how quickly patterns click into place.`,
    languages_spoken: ['German (Native)', 'English (Fluent)', 'Spanish (Conversational)'],
    specialties: ['Goethe-Zertifikat A1-B2', 'Ausbildung Prep', 'German Grammar Made Easy', 'Job Interviews in Germany'],
    education: [
      'MA in DaF (Deutsch als Fremdsprache) — Humboldt-Universität zu Berlin',
      'Certified telc & Goethe Examiner',
    ],
    reviews: [
      {
        id: 'rev-301',
        rating: 5,
        comment: 'Passed my Goethe B2 exam on the first attempt thanks to Hannah! Her mock exam sessions are spot on.',
        createdAt: '2026-08-05T11:00:00Z',
        studentName: 'Amanuel Kebede',
      },
      {
        id: 'rev-302',
        rating: 5,
        comment: 'Great educator who understands the hurdles non-European speakers face when learning German cases and articles.',
        createdAt: '2026-06-18T16:20:00Z',
        studentName: 'Lina Al-Hassan',
      },
    ],
  },
  {
    id: 'sample-4',
    name: 'Dawit Tolosa',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
    languages: ['Afan Oromo', 'English', 'Amharic'],
    rating: 4.95,
    lessonsTaught: 980,
    hourlyRate: 26,
    teacherType: 'professional',
    headline: 'Oromia Native · Conversational Fluency & Cultural Immersion',
    bio: `Akkam jirtu! My name is Dawit. I am a native Afan Oromo speaker and educator with a passion for sharing the Oromo language, literature, and cultural heritage.

I work with beginners who want to learn everyday greetings and vocabulary, as well as intermediate students looking to deepen their grasp of Oromo grammar, proverbs, and formal discourse. My lessons are fun, practical, and culturally grounded.`,
    languages_spoken: ['Afan Oromo (Native)', 'Amharic (Native)', 'English (Fluent)'],
    specialties: ['Conversational Oromo', 'Oromo Alphabet (Qubee)', 'Cultural Context', 'Practical Vocabulary'],
    education: [
      'BA in Oromo Folklore and Literature — Jimma University',
      'Certificate in Horn of Africa Bilingual Education',
    ],
    reviews: [
      {
        id: 'rev-401',
        rating: 5,
        comment: 'Dawit makes learning Qubee and everyday Oromo so simple and practical. Highly recommend him!',
        createdAt: '2026-08-14T13:00:00Z',
        studentName: 'Tolawak Benti',
      },
    ],
  },
  {
    id: 'sample-5',
    name: 'Antoine Laurent',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    languages: ['French', 'English'],
    rating: 4.96,
    lessonsTaught: 1120,
    hourlyRate: 38,
    teacherType: 'professional',
    headline: 'Sorbonne Graduate · Diplomatic French & DELF Exam Specialist',
    bio: `Bonjour! I am Antoine, a certified French teacher from Paris. Having taught at French cultural institutes and universities, I specialize in diplomatic French, DELF/DALF exam preparation, and elegant conversational French.

I believe in active speaking from lesson one. We will analyze contemporary articles, discuss global affairs, and refine your French pronunciation to sound natural and effortless.`,
    languages_spoken: ['French (Native)', 'English (Fluent)', 'Italian (Intermediate)'],
    specialties: ['DELF / DALF Exam Prep', 'Diplomatic & Business French', 'Pronunciation & Phonics', 'French Literature'],
    education: [
      'Master en Lettres Modernes — Université Paris-Sorbonne',
      'Alliance Française DAEFLE Certified',
    ],
    reviews: [
      {
        id: 'rev-501',
        rating: 5,
        comment: 'Antoine is a master of teaching nuanced French expressions and diplomatic etiquette. Highly polished sessions.',
        createdAt: '2026-07-22T10:30:00Z',
        studentName: 'Selamawit Girma',
      },
    ],
  },
  {
    id: 'sample-6',
    name: 'Tariq Al-Mansoor',
    avatarUrl: 'https://images.unsplash.com/photo-1507081323647-4d2504a4b919?q=80&w=800&auto=format&fit=crop',
    languages: ['Arabic', 'English'],
    rating: 4.94,
    lessonsTaught: 940,
    hourlyRate: 32,
    teacherType: 'professional',
    headline: 'Native Cairo Educator · Modern Standard & Business Arabic',
    bio: `Ahlan wa Sahlan! I am Tariq from Cairo, Egypt. I specialize in Modern Standard Arabic (Fusha) as well as Egyptian Colloquial Arabic.

Whether you are studying Arabic for business in the Gulf, religious scholarship, journalism, or travel across the Middle East and North Africa, my step-by-step approach ensures steady, confident progress.`,
    languages_spoken: ['Arabic (Native)', 'English (Fluent)'],
    specialties: ['Modern Standard Arabic', 'Egyptian Colloquial', 'Arabic Calligraphy Basics', 'Business Arabic'],
    education: [
      'BA in Arabic Language and Islamic Studies — Al-Azhar University',
    ],
    reviews: [
      {
        id: 'rev-601',
        rating: 5,
        comment: 'Tariq breaks down Arabic root verbs and grammar with such clarity. I feel so much more confident reading news articles.',
        createdAt: '2026-08-01T12:00:00Z',
        studentName: 'Hamid Idris',
      },
    ],
  },
  {
    id: 'sample-7',
    name: 'Matteo Rossi',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    languages: ['Italian', 'English'],
    rating: 4.93,
    lessonsTaught: 760,
    hourlyRate: 30,
    teacherType: 'professional',
    headline: 'Florence Native · Conversational Practice & Travel Italian',
    bio: `Ciao a tutti! I am Matteo from Florence, Italy. I love helping students fall in love with the Italian language, its music, culinary culture, and regional charm.

My lessons are dynamic, filled with real dialogues, culture tips, and practical exercises designed to get you speaking right away.`,
    languages_spoken: ['Italian (Native)', 'English (Fluent)'],
    specialties: ['Travel Italian', 'Everyday Conversation', 'CILS Exam Prep', 'Italian Culture & Cuisine'],
    education: [
      'Laurea in Lingue e Letterature Straniere — Università degli Studi di Firenze',
    ],
    reviews: [
      {
        id: 'rev-701',
        rating: 5,
        comment: 'Matteo is enthusiastic, encouraging, and made our conversation practice the highlight of my week!',
        createdAt: '2026-07-19T17:00:00Z',
        studentName: 'Sophie Lindqvist',
      },
    ],
  },
  {
    id: 'sample-8',
    name: 'Lin Wei',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    languages: ['Mandarin', 'English'],
    rating: 4.99,
    lessonsTaught: 1890,
    hourlyRate: 36,
    teacherType: 'professional',
    headline: 'Beijing Standard Accent · HSK 1–6 & Commercial Chinese',
    bio: `Ni hao! I am Lin, a certified Mandarin instructor based in Beijing. I have taught over 1,800 lessons to international students, entrepreneurs, and diplomats.

My focus is on tone accuracy, pinyin mastery, character recognition, and business negotiation etiquette. With interactive exercises and spaced repetition, learning Chinese becomes straightforward and deeply rewarding.`,
    languages_spoken: ['Mandarin (Native - Standard Beijing)', 'English (Fluent)'],
    specialties: ['HSK 1-6 Prep', 'Pinyin & Tone Mastery', 'Commercial Chinese', 'Chinese Characters (Hanzi)'],
    education: [
      'MA in Teaching Chinese to Speakers of Other Languages (TCSOL) — Beijing Language and Culture University',
    ],
    reviews: [
      {
        id: 'rev-801',
        rating: 5,
        comment: 'Lin is phenomenal with tones and pinyin. She corrected mistakes other tutors never caught. Passed HSK 4 with high marks!',
        createdAt: '2026-08-25T14:30:00Z',
        studentName: 'Michael Chen',
      },
    ],
  },
];

export function getSampleTeacherById(id: string): SampleTeacherDetail | undefined {
  return SAMPLE_TEACHERS.find((t) => t.id === id);
}
