export type UserRole = "admin" | "teacher" | "student";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  pass_percentage: number;
  start_time: string;
  end_time: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  teacher?: Profile;
}

export type QuestionType = "mcq" | "true_false";

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  type: QuestionType;
  marks: number;
  options: string[];
  correct_answer: string;
  created_at: string;
  updated_at: string;
}

export interface StudentQuestionView {
  id: string;
  exam_id: string;
  question_text: string;
  type: QuestionType;
  marks: number;
  options: string[];
}

export type AttemptStatus = "in_progress" | "submitted" | "expired";

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number;
  total_marks: number;
  passed: boolean;
  status: AttemptStatus;
  created_at: string;
  exam?: Exam;
  student?: Profile;
}

export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean;
  marks_awarded: number;
  created_at: string;
  question?: Question;
}
