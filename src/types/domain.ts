export type WorkoutType =
  | "peito"
  | "costas"
  | "perna"
  | "cardio"
  | "braco"
  | "full_body"
  | "mobilidade"
  | "outro";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  goal: string | null;
  current_gym: string | null;
  created_at: string;
};

export type League = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  invite_code: string;
  is_public: boolean;
  created_at: string;
};

export type LeagueMember = {
  league_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  score_cache: number;
  joined_at: string;
  users?: UserProfile;
};

export type Checkin = {
  id: string;
  league_id: string;
  user_id: string;
  workout_type: WorkoutType;
  note: string | null;
  photo_url: string | null;
  checked_in_at: string;
  checked_in_on: string;
  verification_status: "self_reported" | "photo_pending" | "gps_pending" | "verified";
};

export type Challenge = {
  id: string;
  league_id: string;
  title: string;
  description: string;
  points: number;
  challenge_type: "weekly_count" | "streak" | "workout_type_count" | "weekday" | "monthly_count";
  target_value: number;
  workout_type: WorkoutType | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
};

export type UserChallenge = {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  status: "active" | "completed" | "expired";
  completed_at: string | null;
};

export type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  points: number;
};

export type FeedPost = {
  id: string;
  league_id: string;
  user_id: string;
  checkin_id: string | null;
  achievement_id: string | null;
  message: string;
  created_at: string;
  users?: Pick<UserProfile, "name" | "avatar_url">;
  checkins?: Pick<Checkin, "photo_url" | "workout_type" | "note"> | null;
  likes_count: number;
  liked_by_me: boolean;
  comments_count: number;
  comments: FeedComment[];
};

export type FeedComment = {
  id: string;
  body: string;
  created_at: string;
  users?: Pick<UserProfile, "name" | "avatar_url">;
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  points: number;
  checkins: number;
  weeklyFrequency: number;
  streak: number;
  rank: number;
};
