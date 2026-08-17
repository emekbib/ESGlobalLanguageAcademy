export type UserRole = 'student' | 'teacher';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export type TeacherType = 'professional' | 'community_tutor';

export interface TeacherProfile {
  id: string;
  user_id: string;
  bio: string | null;
  languages_taught: string[];
  hourly_rate: number;
  years_experience: number;
  video_intro_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  teacher_type: TeacherType;
  specialties: string[];
  languages_spoken: string[];
  credentials: string[];
}

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  student_id: string;
  teacher_id: string;
  start_time_utc: string;
  end_time_utc: string;
  status: BookingStatus;
  created_at: string;
  hold_expires_at: string | null;
  checkout_session_id: string | null;
  payment_intent_id: string | null;
  amount_cents: number | null;
  platform_fee_cents: number | null;
  teacher_payout_cents: number | null;
  payout_transfer_id: string | null;
  daily_room_url: string | null;
}

export interface Review {
  id: string;
  booking_id: string;
  student_id: string;
  teacher_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id?: string;
          user_id?: string;
          role: UserRole;
          user_type: UserRole;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          user_type?: UserRole;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      teacher_profiles: {
        Row: TeacherProfile;
        Insert: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          languages_taught?: string[];
          hourly_rate: number;
          years_experience: number;
          video_intro_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          languages_taught?: string[];
          hourly_rate?: number;
          years_experience?: number;
          video_intro_url?: string | null;
          is_published?: boolean;
          updated_at?: string;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
        };
      };
      teacher_availability: {
        Row: TeacherAvailability;
        Insert: {
          id?: string;
          teacher_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          timezone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          timezone?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: Booking;
        Insert: {
          id?: string;
          student_id?: string;
          teacher_id: string;
          start_time_utc: string;
          end_time_utc: string;
          status?: BookingStatus;
          created_at?: string;
          hold_expires_at?: string | null;
          checkout_session_id?: string | null;
          payment_intent_id?: string | null;
          amount_cents?: number | null;
          platform_fee_cents?: number | null;
          teacher_payout_cents?: number | null;
          payout_transfer_id?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          start_time_utc?: string;
          end_time_utc?: string;
          status?: BookingStatus;
          created_at?: string;
          hold_expires_at?: string | null;
          checkout_session_id?: string | null;
          payment_intent_id?: string | null;
          amount_cents?: number | null;
          platform_fee_cents?: number | null;
          teacher_payout_cents?: number | null;
          payout_transfer_id?: string | null;
        };
      };
      reviews: {
        Row: Review;
        Insert: {
          id?: string;
          booking_id: string;
          student_id?: string;
          teacher_id: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          student_id?: string;
          teacher_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };
    };
  };
}
