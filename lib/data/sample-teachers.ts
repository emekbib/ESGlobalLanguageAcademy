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
    hourlyRate: 28,
    teacherType: 'professional',
    headline: 'Addis Ababa University Alum · Fidel Script & Conversational Amharic',
    bio: `Selam! I am Bethelhem, a native Amharic educator born and raised in Addis Ababa. I hold a Bachelor's Degree in Linguistics from Addis Ababa University and have spent the last 6 years teaching Amharic to diaspora Ethiopians, expats, diplomatic professionals, and language enthusiasts worldwide.

My teaching method focuses on rapid conversational fluency through immersion, cultural storytelling, and practical dialogue. Whether you want to master the Ge'ez / Fidel script, practice speaking with your relatives, or prepare for business in Ethiopia, our lessons will be structured, patient, and thoroughly engaging.`,
    languages_spoken: ['Amharic (Native)', 'English (Fluent)'],
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
    name: 'Semhar Berhane',
    avatarUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=800&auto=format&fit=crop',
    languages: ['Tigrigna'],
    rating: 4.98,
    lessonsTaught: 1420,
    hourlyRate: 30,
    teacherType: 'professional',
    headline: 'Native Tigrigna Educator · Ge’ez Script, Grammar & Everyday Dialogue',
    bio: `Selam! I am Semhar, a native Tigrigna speaker and certified educator. Over the last 5 years, I have helped diaspora students in North America, Europe, and Australia reconnect with their linguistic roots.

From mastering the Ge’ez alphabet to holding lively everyday conversations with family, I create an encouraging and patient environment tailored to your pace and goals.`,
    languages_spoken: ['Tigrigna (Native)', 'English (Fluent)', 'Amharic (Conversational)'],
    specialties: ['Tigrigna Alphabet & Reading', 'Conversational Tigrigna', 'Heritage Learners', 'Cultural Storytelling'],
    education: [
      'BA in Literature & Languages — University of Asmara',
      'Certified Horn of Africa Heritage Language Educator',
    ],
    reviews: [
      {
        id: 'rev-201',
        rating: 5,
        comment: 'Semhar helped me speak with my grandparents in Tigrigna for the first time without switching to English. Truly life-changing!',
        createdAt: '2026-08-11T09:00:00Z',
        studentName: 'Filmon Ghebre',
      },
      {
        id: 'rev-202',
        rating: 5,
        comment: 'Clear, direct, and encouraging. She made reading the Tigrigna Fidel script enjoyable and easy.',
        createdAt: '2026-07-29T14:00:00Z',
        studentName: 'Eden Michael',
      },
    ],
  },
  {
    id: 'sample-3',
    name: 'Dawit Tolosa',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
    languages: ['Afaan Oromo'],
    rating: 4.96,
    lessonsTaught: 980,
    hourlyRate: 26,
    teacherType: 'professional',
    headline: 'Oromia Native · Qubee Script, Conversational Fluency & Cultural Immersion',
    bio: `Akkam jirtu! My name is Dawit. I am a native Afaan Oromo educator with a deep passion for sharing the Oromo language, literature, and cultural heritage.

I work with complete beginners learning everyday greetings and vocabulary, as well as intermediate students looking to master Qubee phonetics, grammar, proverbs, and formal conversation.`,
    languages_spoken: ['Afaan Oromo (Native)', 'Amharic (Native)', 'English (Fluent)'],
    specialties: ['Conversational Afaan Oromo', 'Qubee Alphabet', 'Cultural Context', 'Practical Vocabulary'],
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
    id: 'sample-4',
    name: 'Ayan Warsame',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=800&auto=format&fit=crop',
    languages: ['Somali'],
    rating: 4.97,
    lessonsTaught: 1250,
    hourlyRate: 29,
    teacherType: 'professional',
    headline: 'Native Somali Instructor · Conversational Fluency & Diaspora Mentorship',
    bio: `Soo dhowow! I am Ayan, a native Somali language educator dedicated to helping students achieve conversational fluency and cultural confidence.

Whether you are connecting with family, preparing for humanitarian work, or exploring the rich poetic traditions of Somalia, our 1-on-1 sessions will get you speaking naturally from day one.`,
    languages_spoken: ['Somali (Native)', 'English (Fluent)', 'Arabic (Conversational)'],
    specialties: ['Conversational Somali', 'Somali Grammar & Syntax', 'Diaspora Youth', 'Cultural Idioms'],
    education: [
      'BA in Education & Linguistics — Somali National University',
      'Certified Somali Second Language Instructor',
    ],
    reviews: [
      {
        id: 'rev-301',
        rating: 5,
        comment: 'Ayan is fantastic! Her lesson materials are well-structured and she explains sentence patterns with great patience.',
        createdAt: '2026-08-05T11:00:00Z',
        studentName: 'Guled Jama',
      },
      {
        id: 'rev-302',
        rating: 3,
        comment: 'Helped me rebuild my vocabulary quickly before traveling to Hargeisa.',
        createdAt: '2026-06-18T16:20:00Z',
        studentName: 'Khadija Osman',
      },
    ],
  },
  {
    id: 'sample-5',
    name: 'Juma Bakari',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    languages: ['Swahili'],
    rating: 4.99,
    lessonsTaught: 1680,
    hourlyRate: 27,
    teacherType: 'professional',
    headline: 'Dar es Salaam Alum · Kiswahili Sanifu, Business & Travel Immersion',
    bio: `Habari za leo! I am Juma, a native Swahili teacher born on the East African coast. I teach standard Kiswahili (Kiswahili Sanifu) for business travelers, researchers, students, and culture lovers.

My method blends conversational immersion with clear grammar breakdowns, noun class mastery, and real-life East African etiquette.`,
    languages_spoken: ['Swahili (Native)', 'English (Fluent)'],
    specialties: ['Kiswahili Sanifu', 'Noun Classes & Grammar', 'East African Travel', 'Business Swahili'],
    education: [
      'BA in Kiswahili and Education — University of Dar es Salaam',
      'Certificate in Teaching Swahili as a Foreign Language (BAKITA)',
    ],
    reviews: [
      {
        id: 'rev-501',
        rating: 5,
        comment: 'Juma is an exceptional Swahili educator. He simplified the noun class system which always confused me before!',
        createdAt: '2026-07-22T10:30:00Z',
        studentName: 'Alexander Hayes',
      },
    ],
  },
  {
    id: 'sample-6',
    name: 'Mebrahtu Tesfay',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    languages: ['Tigrigna', 'Amharic'],
    rating: 4.95,
    lessonsTaught: 890,
    hourlyRate: 27,
    teacherType: 'professional',
    headline: 'Bilingual Horn of Africa Tutor · Tigrigna & Amharic Pronunciation Specialist',
    bio: `Selam! I am Mebrahtu, specializing in both Tigrigna and Amharic. With 4+ years of tutoring experience, I guide learners through phonetics, Ge'ez root structures, and conversational practice.`,
    languages_spoken: ['Tigrigna (Native)', 'Amharic (Native)', 'English (Fluent)'],
    specialties: ['Comparative Semitic Roots', 'Conversational Tigrigna', 'Amharic Grammar', 'Pronunciation Drills'],
    education: [
      'BA in Linguistics — Mekelle University',
    ],
    reviews: [
      {
        id: 'rev-601',
        rating: 5,
        comment: 'Mebrahtu is awesome if you want to understand both Tigrigna and Amharic side-by-side.',
        createdAt: '2026-08-01T12:00:00Z',
        studentName: 'Robel Tekle',
      },
    ],
  },
  {
    id: 'sample-7',
    name: 'Fatuma Hassan',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    languages: ['Somali', 'Swahili'],
    rating: 4.96,
    lessonsTaught: 1100,
    hourlyRate: 28,
    teacherType: 'professional',
    headline: 'Regional East African Faculty · Somali & Swahili for Beginners & Diaspora',
    bio: `Soo dhowow na Karibu! I am Fatuma, fluent in both Somali and Swahili. I work with diaspora students, diplomats, and NGO workers across Kenya, Somalia, and Tanzania to build authentic speaking skills rapidly.`,
    languages_spoken: ['Somali (Native)', 'Swahili (Native)', 'English (Fluent)'],
    specialties: ['Somali for Beginners', 'Everyday Kiswahili', 'Cross-Border Culture', 'Grammar Basics'],
    education: [
      'BA in Intercultural Communication — Kenyatta University',
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
    teacherType: 'professional',
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
