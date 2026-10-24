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
    id: 'sample-2',
    name: 'Semhar Berhane',
    avatarUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=800&auto=format&fit=crop',
    languages: ['Tigrinya'],
    rating: 4.98,
    lessonsTaught: 1420,
    hourlyRate: 30,
    teacherType: 'community_tutor',
    headline: 'Native Tigrinya Educator · Ge’ez Script, Grammar & Everyday Dialogue',
    bio: `Selam! I am Semhar, a native Tigrinya speaker and certified educator. Over the last 5 years, I have helped diaspora students in North America, Europe, and Australia reconnect with their linguistic roots.

From mastering the Ge’ez alphabet to holding lively everyday conversations with family, I create an encouraging and patient environment tailored to your pace and goals.`,
    languages_spoken: ['Tigrinya (Native)', 'English (Fluent)', 'Amharic (Conversational)'],
    specialties: ['Tigrinya Alphabet & Reading', 'Conversational Tigrinya', 'Heritage Learners', 'Cultural Storytelling'],
    video_intro_url: 'https://www.youtube.com/watch?v=0k2ZzkwWzV8',
    education: [
      'BA in Literature & Languages — University of Asmara',
      'Certified Horn of Africa Heritage Language Educator',
    ],
    reviews: [
      {
        id: 'rev-201',
        rating: 5,
        comment: 'Semhar helped me speak with my grandparents in Tigrinya for the first time without switching to English. Truly life-changing!',
        createdAt: '2026-08-11T09:00:00Z',
        studentName: 'Filmon Ghebre',
      },
      {
        id: 'rev-202',
        rating: 5,
        comment: 'Clear, direct, and encouraging. She made reading the Tigrinya Fidel script enjoyable and easy.',
        createdAt: '2026-07-29T14:00:00Z',
        studentName: 'Eden Michael',
      },
    ],
  },
  {
    id: 'sample-3',
    name: 'Dawit Tolosa',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    languages: ['Afaan Oromo', 'Amharic'],
    rating: 4.97,
    lessonsTaught: 1120,
    hourlyRate: 26,
    teacherType: 'professional',
    headline: 'Bilingual Horn of Africa Faculty · Qubee Script, Oromo Proverbs & Culture',
    bio: `Akkam jirtu! I am Dawit, born and raised in Oromia, Ethiopia. I hold a degree in Language and Literature from Jimma University. I specialize in teaching Afaan Oromo using the Latin Qubee orthography as well as Amharic.

My lessons emphasize grammatical precision, cultural context, proverbs (Mammaaksa), and conversational fluency for work, family, or travel in the Horn of Africa.`,
    languages_spoken: ['Afaan Oromo (Native)', 'Amharic (Fluent)', 'English (Fluent)'],
    specialties: ['Qubee Writing System', 'Everyday Conversational Oromo', 'Oromo Proverbs & Culture', 'Bilingual Oromo/Amharic'],
    video_intro_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    education: [
      'BA in Afaan Oromo & Literature — Jimma University',
      'Professional Certification in Horn of Africa Bilingual Pedagogy',
    ],
    reviews: [
      {
        id: 'rev-301',
        rating: 5,
        comment: 'Dawit is an exceptional teacher. He breaks down the grammar of Afaan Oromo and helps you grasp pronoun cases effortlessly.',
        createdAt: '2026-08-18T11:20:00Z',
        studentName: 'Bona Gemechu',
      },
      {
        id: 'rev-302',
        rating: 5,
        comment: 'Learning Qubee was intimidating until I took lessons with Dawit. He makes it fun, intuitive, and extremely rewarding.',
        createdAt: '2026-07-03T16:15:00Z',
        studentName: 'Sarah Jenkins',
      },
    ],
  },
  {
    id: 'sample-4',
    name: 'Ayan Warsame',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
    languages: ['Somali'],
    rating: 4.96,
    lessonsTaught: 1340,
    hourlyRate: 29,
    teacherType: 'community_tutor',
    headline: 'Native Somali Instructor · Conversational Fluency & Diaspora Mentorship',
    bio: `Soo dhowow! My name is Ayan. I am a native Somali speaker and cultural mentor based in London. For the past 5 years, I have taught Somali to students of all ages across the UK, United States, and Canada.

Whether you are connecting with family, preparing for humanitarian work, or exploring the rich poetic traditions of Somalia, our 1-on-1 sessions will get you speaking naturally from day one.`,
    languages_spoken: ['Somali (Native)', 'English (Fluent)', 'Arabic (Conversational)'],
    specialties: ['Somali Vocabulary & Dialects', 'Conversational Somali', 'Diaspora Youth Fluency', 'Somali Poetry & Proverbs'],
    video_intro_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-speaking-on-a-video-call-with-colleagues-43526-large.mp4',
    education: [
      'BA in English & Linguistics — School of Oriental and African Studies (SOAS), London',
      'Certified Somali Second Language Instructor',
    ],
    reviews: [
      {
        id: 'rev-401',
        rating: 5,
        comment: 'Ayan has been a game-changer for my Somali! Her lessons are fun, practical, and filled with cultural nuances you will not find in any textbook.',
        createdAt: '2026-08-05T08:45:00Z',
        studentName: 'Khadar Jama',
      },
      {
        id: 'rev-402',
        rating: 5,
        comment: 'Super engaging teacher. I was able to talk to my relatives in Mogadishu with newfound confidence after only two months.',
        createdAt: '2026-06-19T13:10:00Z',
        studentName: 'Marianne Dubois',
      },
    ],
  },
  {
    id: 'sample-5',
    name: 'Jemal Abdi',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    languages: ['Somali', 'Amharic'],
    rating: 4.98,
    lessonsTaught: 1650,
    hourlyRate: 28,
    teacherType: 'professional',
    headline: 'Bilingual Horn of Africa Faculty · Somali & Conversational Amharic Specialist',
    bio: `Soo dhowow and Selam! I am Jemal, born and raised in the Horn of Africa. I hold a degree from Addis Ababa University and have over 7 years of experience teaching both Somali and Amharic to diaspora youth, professionals, and heritage learners.

My interactive method focuses on pronunciation accuracy, everyday conversation, and the shared cultural proverbs of the Horn of Africa.`,
    languages_spoken: ['Somali (Native)', 'Amharic (Native)', 'English (Fluent)'],
    specialties: ['Conversational Somali', 'Everyday Amharic', 'Horn of Africa Cultural Fluency', 'Grammar Fundamentals'],
    education: [
      'BA in Linguistics & Horn of Africa Languages — Addis Ababa University',
      'Certificate in Horn of Africa Bilingual Pedagogy',
    ],
    reviews: [
      {
        id: 'rev-501',
        rating: 5,
        comment: 'Jemal is an exceptional educator. He made learning both Somali and Amharic intuitive and culturally rich!',
        createdAt: '2026-07-22T10:30:00Z',
        studentName: 'Alexander Hayes',
      },
    ],
  },
  {
    id: 'sample-6',
    name: 'Mebrahtu Tesfay',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    languages: ['Tigrinya', 'Amharic'],
    rating: 4.95,
    lessonsTaught: 890,
    hourlyRate: 27,
    teacherType: 'professional',
    headline: 'Bilingual Horn of Africa Faculty · Tigrinya & Amharic Pronunciation Specialist',
    bio: `Selam! I am Mebrahtu, specializing in both Tigrinya and Amharic. With 4+ years of tutoring experience, I guide learners through phonetics, Ge'ez root structures, and conversational practice.`,
    languages_spoken: ['Tigrinya (Native)', 'Amharic (Native)', 'English (Fluent)'],
    specialties: ['Comparative Semitic Roots', 'Conversational Tigrinya', 'Amharic Grammar', 'Pronunciation Drills'],
    video_intro_url: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-remote-meeting-on-a-laptop-42999-large.mp4',
    education: [
      'BA in Linguistics — Mekelle University',
    ],
    reviews: [
      {
        id: 'rev-601',
        rating: 5,
        comment: 'Mebrahtu is awesome if you want to understand both Tigrinya and Amharic side-by-side.',
        createdAt: '2026-08-01T12:00:00Z',
        studentName: 'Robel Tekle',
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
