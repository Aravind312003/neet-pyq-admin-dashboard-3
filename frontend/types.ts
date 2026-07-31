export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  disabled?: boolean;
}

export interface StaffRegistrationRequest {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  requested_role: 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface Question {
  id: string;
  year: number;
  subject: 'Physics' | 'Chemistry' | 'Biology' | string;
  chapter: string;
  question_number: number;
  question: string;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  timestamp: string;
  question_id?: string | null;
  old_value?: string | null;
  new_value?: string | null;
}

export interface SubjectStat {
  subject: string;
  count: number;
}

export interface YearStat {
  year: number;
  count: number;
}

export interface IncorrectQuestionStat {
  question_id: string;
  question_text: string;
  incorrect_count: number;
  subject: string;
}

export interface DifficultyStats {
  easyPercent: number;
  mediumPercent: number;
  hardPercent: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface UserActivity {
  dau: number;
  wau: number;
  mau: number;
  timeline7: any[];
  timeline30: any[];
  timeline90: any[];
}

export interface StudentReport {
  id: string;
  question_id?: string | null;
  student_email: string;
  student_name?: string;
  issue_type: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  timestamp: string;
  admin_note?: string;
  question_details?: Question | null;
}

export interface DashboardAnalytics {
  totalQuestions: number;
  totalUsers: number;
  activeUsers24h: number;
  testsAttempted: number;
  subjectStats: SubjectStat[];
  yearStats: YearStat[];
  mostIncorrectQuestions: IncorrectQuestionStat[];
  difficultyStats?: DifficultyStats;
  userActivity?: UserActivity;
  testDropOff?: any[];
  subjectPerformance?: any[];
  topicHeatmap?: any[];
}