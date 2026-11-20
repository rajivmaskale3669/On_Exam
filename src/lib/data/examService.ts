import { createClient } from "@/lib/supabase/client";
import {
  Exam,
  Question,
  ExamAttempt,
  StudentAnswer,
  Profile,
  StudentQuestionView,
} from "@/types/database";

export const examService = {
  // ====================================================================
  // PROFILES & USER MANAGEMENT (Admin)
  // ====================================================================
  async getProfiles(): Promise<Profile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as Profile[]) ?? [];
  },

  async toggleProfileStatus(profileId: string, currentStatus: boolean): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentStatus })
      .eq("id", profileId);

    if (error) throw new Error(error.message);
    return true;
  },

  // ====================================================================
  // EXAMS (Teacher & Admin)
  // ====================================================================
  async getExams(role?: string, teacherId?: string): Promise<Exam[]> {
    const supabase = createClient();
    let query = supabase.from("exams").select("*");

    if (role === "teacher" && teacherId) {
      query = query.eq("teacher_id", teacherId);
    } else if (role === "student") {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as Exam[]) ?? [];
  },

  async getExamById(id: string): Promise<Exam | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // row not found
      throw new Error(error.message);
    }
    return data as Exam;
  },

  async createExam(
    examData: Omit<Exam, "id" | "created_at" | "updated_at">
  ): Promise<Exam> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("exams")
      .insert([examData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Exam;
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("exams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Exam;
  },

  async deleteExam(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  },

  async togglePublishExam(id: string, currentStatus: boolean): Promise<boolean> {
    const result = await this.updateExam(id, { is_published: !currentStatus });
    return !!result;
  },

  // ====================================================================
  // QUESTIONS (Teacher & Exam taking)
  // ====================================================================
  async getQuestions(examId: string): Promise<Question[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", examId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return (data as Question[]) ?? [];
  },

  async getQuestionsForStudent(examId: string): Promise<StudentQuestionView[]> {
    const questions = await this.getQuestions(examId);
    // Securely strip correct_answer so candidates cannot view it
    return questions.map(({ id, exam_id, question_text, type, marks, options }) => ({
      id,
      exam_id,
      question_text,
      type,
      marks,
      options,
    }));
  },

  async createQuestion(
    questionData: Omit<Question, "id" | "created_at" | "updated_at">
  ): Promise<Question> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("questions")
      .insert([questionData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    await this.recalculateExamTotalMarks(questionData.exam_id);
    return data as Question;
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (data?.exam_id) await this.recalculateExamTotalMarks(data.exam_id);
    return data as Question;
  },

  async deleteQuestion(id: string, examId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await this.recalculateExamTotalMarks(examId);
    return true;
  },

  async recalculateExamTotalMarks(examId: string): Promise<void> {
    const questions = await this.getQuestions(examId);
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    await this.updateExam(examId, { total_marks: totalMarks });
  },

  // ====================================================================
  // ATTEMPTS & EXAM SUBMISSIONS (Student)
  // ====================================================================
  async startAttempt(examId: string, studentId: string): Promise<ExamAttempt> {
    const supabase = createClient();

    // Check if attempt already exists for this student
    const { data: existing } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("exam_id", examId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existing) {
      return existing as ExamAttempt;
    }

    const exam = await this.getExamById(examId);
    const newAttempt = {
      exam_id: examId,
      student_id: studentId,
      started_at: new Date().toISOString(),
      total_marks: exam?.total_marks || 0,
      status: "in_progress",
    };

    const { data, error } = await supabase
      .from("exam_attempts")
      .insert([newAttempt])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ExamAttempt;
  },

  async getAttemptById(attemptId: string): Promise<ExamAttempt | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*, exam:exams(*)")
      .eq("id", attemptId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data as ExamAttempt;
  },

  async getAttemptsByStudent(studentId: string): Promise<ExamAttempt[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*, exam:exams(*)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as ExamAttempt[]) ?? [];
  },

  async getAttemptsByExam(examId: string): Promise<ExamAttempt[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*, student:profiles(*)")
      .eq("exam_id", examId)
      .order("submitted_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as ExamAttempt[]) ?? [];
  },

  async submitAttempt(
    attemptId: string,
    answers: { question_id: string; selected_answer: string }[]
  ): Promise<{
    score: number;
    total_marks: number;
    passed: boolean;
  }> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
      p_answers: answers,
    });

    if (error) throw new Error(error.message);
    return {
      score: data.score,
      total_marks: data.total_marks,
      passed: data.passed,
    };
  },

  async getStudentAnswersForAttempt(attemptId: string): Promise<StudentAnswer[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("student_answers")
      .select("*, question:questions(*)")
      .eq("attempt_id", attemptId);

    if (error) throw new Error(error.message);
    return (data as StudentAnswer[]) ?? [];
  },

  // ====================================================================
  // STATS & ANALYTICS
  // ====================================================================
  async getTeacherAnalytics(teacherId: string) {
    const supabase = createClient();
    const { data: exams, error: examsError } = await supabase
      .from("exams")
      .select("*")
      .eq("teacher_id", teacherId);

    if (examsError) throw new Error(examsError.message);
    const examList = (exams as Exam[]) ?? [];

    if (examList.length === 0) {
      return {
        totalExams: 0,
        publishedExams: 0,
        totalSubmissions: 0,
        passedSubmissions: 0,
        failedSubmissions: 0,
        averagePercentage: 0,
        passRate: 0,
        exams: [],
      };
    }

    const examIds = examList.map((e) => e.id);
    const { data: attemptsData, error: attemptsError } = await supabase
      .from("exam_attempts")
      .select("*")
      .in("exam_id", examIds);

    if (attemptsError) throw new Error(attemptsError.message);
    const allAttempts = (attemptsData as ExamAttempt[]) ?? [];

    const submitted = allAttempts.filter((a) => a.status === "submitted");
    const passed = submitted.filter((a) => a.passed);

    const totalScore = submitted.reduce(
      (sum, a) => sum + (a.score / (a.total_marks || 1)) * 100,
      0
    );
    const averagePercentage = submitted.length > 0 ? Math.round(totalScore / submitted.length) : 0;
    const passRate = submitted.length > 0 ? Math.round((passed.length / submitted.length) * 100) : 0;

    return {
      totalExams: examList.length,
      publishedExams: examList.filter((e) => e.is_published).length,
      totalSubmissions: submitted.length,
      passedSubmissions: passed.length,
      failedSubmissions: submitted.length - passed.length,
      averagePercentage,
      passRate,
      exams: examList,
    };
  },

  async getAdminPlatformStats() {
    const supabase = createClient();
    const [profilesRes, examsRes, attemptsRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("exams").select("*"),
      supabase.from("exam_attempts").select("id"),
    ]);

    if (profilesRes.error) throw new Error(profilesRes.error.message);
    if (examsRes.error) throw new Error(examsRes.error.message);
    if (attemptsRes.error) throw new Error(attemptsRes.error.message);

    const profiles = (profilesRes.data as Profile[]) ?? [];
    const exams = (examsRes.data as Exam[]) ?? [];
    const attempts = attemptsRes.data ?? [];

    const students = profiles.filter((p) => p.role === "student");
    const teachers = profiles.filter((p) => p.role === "teacher");
    const activeUsers = profiles.filter((p) => p.is_active);

    return {
      totalUsers: profiles.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      activeUsers: activeUsers.length,
      totalExams: exams.length,
      publishedExams: exams.filter((e) => e.is_published).length,
      totalAttempts: attempts.length,
    };
  },
};
