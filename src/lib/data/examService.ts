import { createClient } from "@/lib/supabase/client";
import {
  Exam,
  Question,
  ExamAttempt,
  StudentAnswer,
  Profile,
  StudentQuestionView,
} from "@/types/database";
import {
  initialProfiles,
  initialExams,
  initialQuestions,
  initialAttempts,
} from "./mockData";

// Local storage keys for persistent demo/offline mode
const LS_PROFILES = "aura_profiles";
const LS_EXAMS = "aura_exams";
const LS_QUESTIONS = "aura_questions";
const LS_ATTEMPTS = "aura_attempts";
const LS_ANSWERS = "aura_answers";

function getLocalData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

export const examService = {
  // ====================================================================
  // PROFILES & USER MANAGEMENT (Admin)
  // ====================================================================
  async getProfiles(): Promise<Profile[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Profile[];
      }
    } catch {
      // Fallback
    }
    return getLocalData<Profile[]>(LS_PROFILES, initialProfiles);
  },

  async toggleProfileStatus(profileId: string, currentStatus: boolean): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", profileId);

      if (!error) return true;
    } catch {
      // Fallback
    }

    // Local fallback
    const profiles = getLocalData<Profile[]>(LS_PROFILES, initialProfiles);
    const updated = profiles.map((p) =>
      p.id === profileId ? { ...p, is_active: !currentStatus } : p
    );
    setLocalData(LS_PROFILES, updated);
    return true;
  },

  // ====================================================================
  // EXAMS (Teacher & Admin)
  // ====================================================================
  async getExams(role?: string, teacherId?: string): Promise<Exam[]> {
    const supabase = createClient();
    try {
      let query = supabase.from("exams").select("*");

      if (role === "teacher" && teacherId) {
        query = query.eq("teacher_id", teacherId);
      } else if (role === "student") {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Exam[];
      }
    } catch {
      // Fallback
    }

    const localExams = getLocalData<Exam[]>(LS_EXAMS, initialExams);
    if (role === "teacher" && teacherId) {
      return localExams.filter((e) => e.teacher_id === teacherId);
    }
    if (role === "student") {
      return localExams.filter((e) => e.is_published);
    }
    return localExams;
  },

  async getExamById(id: string): Promise<Exam | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as Exam;
      }
    } catch {
      // Fallback
    }

    const localExams = getLocalData<Exam[]>(LS_EXAMS, initialExams);
    return localExams.find((e) => e.id === id) || null;
  },

  async createExam(
    examData: Omit<Exam, "id" | "created_at" | "updated_at">
  ): Promise<Exam> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("exams")
        .insert([examData])
        .select()
        .single();

      if (!error && data) {
        return data as Exam;
      }
    } catch {
      // Fallback
    }

    // Local fallback
    const localExams = getLocalData<Exam[]>(LS_EXAMS, initialExams);
    const newExam: Exam = {
      ...examData,
      id: "exam-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localExams.unshift(newExam);
    setLocalData(LS_EXAMS, localExams);
    return newExam;
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("exams")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return data as Exam;
      }
    } catch {
      // Fallback
    }

    const localExams = getLocalData<Exam[]>(LS_EXAMS, initialExams);
    const index = localExams.findIndex((e) => e.id === id);
    if (index !== -1) {
      localExams[index] = { ...localExams[index], ...updates, updated_at: new Date().toISOString() };
      setLocalData(LS_EXAMS, localExams);
      return localExams[index];
    }
    return null;
  },

  async deleteExam(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (!error) return true;
    } catch {
      // Fallback
    }

    const localExams = getLocalData<Exam[]>(LS_EXAMS, initialExams);
    const filtered = localExams.filter((e) => e.id !== id);
    setLocalData(LS_EXAMS, filtered);
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
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Question[];
      }
    } catch {
      // Fallback
    }

    const localQuestions = getLocalData<Question[]>(LS_QUESTIONS, initialQuestions);
    return localQuestions.filter((q) => q.exam_id === examId);
  },

  async getQuestionsForStudent(examId: string): Promise<StudentQuestionView[]> {
    const questions = await this.getQuestions(examId);
    // Securely strip correct_answer
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
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert([questionData])
        .select()
        .single();

      if (!error && data) {
        // Recalculate exam total marks
        await this.recalculateExamTotalMarks(questionData.exam_id);
        return data as Question;
      }
    } catch {
      // Fallback
    }

    const localQuestions = getLocalData<Question[]>(LS_QUESTIONS, initialQuestions);
    const newQ: Question = {
      ...questionData,
      id: "q-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localQuestions.push(newQ);
    setLocalData(LS_QUESTIONS, localQuestions);
    await this.recalculateExamTotalMarks(questionData.exam_id);
    return newQ;
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("questions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        if (data.exam_id) await this.recalculateExamTotalMarks(data.exam_id);
        return data as Question;
      }
    } catch {
      // Fallback
    }

    const localQuestions = getLocalData<Question[]>(LS_QUESTIONS, initialQuestions);
    const index = localQuestions.findIndex((q) => q.id === id);
    if (index !== -1) {
      localQuestions[index] = { ...localQuestions[index], ...updates, updated_at: new Date().toISOString() };
      setLocalData(LS_QUESTIONS, localQuestions);
      await this.recalculateExamTotalMarks(localQuestions[index].exam_id);
      return localQuestions[index];
    }
    return null;
  },

  async deleteQuestion(id: string, examId: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (!error) {
        await this.recalculateExamTotalMarks(examId);
        return true;
      }
    } catch {
      // Fallback
    }

    const localQuestions = getLocalData<Question[]>(LS_QUESTIONS, initialQuestions);
    const filtered = localQuestions.filter((q) => q.id !== id);
    setLocalData(LS_QUESTIONS, filtered);
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

    // Check if attempt already exists
    try {
      const { data: existing } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("exam_id", examId)
        .eq("student_id", studentId)
        .single();

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

      if (!error && data) {
        return data as ExamAttempt;
      }
    } catch {
      // Fallback
    }

    // Local fallback
    const localAttempts = getLocalData<ExamAttempt[]>(LS_ATTEMPTS, initialAttempts);
    const existing = localAttempts.find(
      (a) => a.exam_id === examId && a.student_id === studentId
    );
    if (existing) return existing;

    const exam = await this.getExamById(examId);
    const attempt: ExamAttempt = {
      id: "att-" + Date.now(),
      exam_id: examId,
      student_id: studentId,
      started_at: new Date().toISOString(),
      submitted_at: null,
      score: 0,
      total_marks: exam?.total_marks || 0,
      passed: false,
      status: "in_progress",
      created_at: new Date().toISOString(),
    };
    localAttempts.push(attempt);
    setLocalData(LS_ATTEMPTS, localAttempts);
    return attempt;
  },

  async getAttemptById(attemptId: string): Promise<ExamAttempt | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*, exam:exams(*)")
        .eq("id", attemptId)
        .single();

      if (!error && data) {
        return data as ExamAttempt;
      }
    } catch {
      // Fallback
    }

    const localAttempts = getLocalData<ExamAttempt[]>(LS_ATTEMPTS, initialAttempts);
    const attempt = localAttempts.find((a) => a.id === attemptId);
    if (!attempt) return null;

    const exam = await this.getExamById(attempt.exam_id);
    return { ...attempt, exam: exam || undefined };
  },

  async getAttemptsByStudent(studentId: string): Promise<ExamAttempt[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*, exam:exams(*)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ExamAttempt[];
      }
    } catch {
      // Fallback
    }

    const localAttempts = getLocalData<ExamAttempt[]>(LS_ATTEMPTS, initialAttempts);
    const studentAttempts = localAttempts.filter((a) => a.student_id === studentId);
    const localExams = getLocalData<Exam[]>(LS_EXAMS, initialExams);

    return studentAttempts.map((att) => ({
      ...att,
      exam: localExams.find((e) => e.id === att.exam_id),
    }));
  },

  async getAttemptsByExam(examId: string): Promise<ExamAttempt[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*, student:profiles(*)")
        .eq("exam_id", examId)
        .order("submitted_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ExamAttempt[];
      }
    } catch {
      // Fallback
    }

    const localAttempts = getLocalData<ExamAttempt[]>(LS_ATTEMPTS, initialAttempts);
    const examAttempts = localAttempts.filter((a) => a.exam_id === examId);
    const localProfiles = getLocalData<Profile[]>(LS_PROFILES, initialProfiles);

    return examAttempts.map((att) => ({
      ...att,
      student: localProfiles.find((p) => p.id === att.student_id),
    }));
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
    try {
      const { data, error } = await supabase.rpc("submit_exam_attempt", {
        p_attempt_id: attemptId,
        p_answers: answers,
      });

      if (!error && data) {
        return {
          score: data.score,
          total_marks: data.total_marks,
          passed: data.passed,
        };
      }
    } catch {
      // Fallback
    }

    // Local evaluation fallback
    const localAttempts = getLocalData<ExamAttempt[]>(LS_ATTEMPTS, initialAttempts);
    const attemptIndex = localAttempts.findIndex((a) => a.id === attemptId);
    if (attemptIndex === -1) throw new Error("Attempt not found");

    const attempt = localAttempts[attemptIndex];
    const exam = await this.getExamById(attempt.exam_id);
    const questions = await this.getQuestions(attempt.exam_id);

    let score = 0;
    const studentAnswersRecord: StudentAnswer[] = [];

    questions.forEach((q) => {
      const ans = answers.find((a) => a.question_id === q.id);
      const isCorrect = ans ? ans.selected_answer === q.correct_answer : false;
      const awarded = isCorrect ? q.marks : 0;
      score += awarded;

      studentAnswersRecord.push({
        id: "ans-" + Date.now() + "-" + q.id,
        attempt_id: attemptId,
        question_id: q.id,
        selected_answer: ans ? ans.selected_answer : null,
        is_correct: isCorrect,
        marks_awarded: awarded,
        created_at: new Date().toISOString(),
        question: q,
      });
    });

    const totalMarks = exam?.total_marks || questions.reduce((s, q) => s + q.marks, 0);
    const passPercentage = exam?.pass_percentage || 50;
    const passed = totalMarks > 0 ? (score / totalMarks) * 100 >= passPercentage : true;

    localAttempts[attemptIndex] = {
      ...attempt,
      submitted_at: new Date().toISOString(),
      score,
      total_marks: totalMarks,
      passed,
      status: "submitted",
    };

    setLocalData(LS_ATTEMPTS, localAttempts);

    // Save student answers
    const allAnswers = getLocalData<StudentAnswer[]>(LS_ANSWERS, []);
    setLocalData(LS_ANSWERS, [...allAnswers.filter((a) => a.attempt_id !== attemptId), ...studentAnswersRecord]);

    return { score, total_marks: totalMarks, passed };
  },

  async getStudentAnswersForAttempt(attemptId: string): Promise<StudentAnswer[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("student_answers")
        .select("*, question:questions(*)")
        .eq("attempt_id", attemptId);

      if (!error && data && data.length > 0) {
        return data as StudentAnswer[];
      }
    } catch {
      // Fallback
    }

    const localAnswers = getLocalData<StudentAnswer[]>(LS_ANSWERS, []);
    const localQuestions = getLocalData<Question[]>(LS_QUESTIONS, initialQuestions);

    return localAnswers
      .filter((a) => a.attempt_id === attemptId)
      .map((a) => ({
        ...a,
        question: localQuestions.find((q) => q.id === a.question_id),
      }));
  },

  // ====================================================================
  // STATS & ANALYTICS
  // ====================================================================
  async getTeacherAnalytics(teacherId: string) {
    const exams = await this.getExams("teacher", teacherId);
    const allAttempts: ExamAttempt[] = [];

    for (const exam of exams) {
      const attempts = await this.getAttemptsByExam(exam.id);
      allAttempts.push(...attempts);
    }

    const totalSubmissions = allAttempts.filter((a) => a.status === "submitted").length;
    const passedSubmissions = allAttempts.filter((a) => a.status === "submitted" && a.passed).length;
    const failedSubmissions = totalSubmissions - passedSubmissions;

    const totalScore = allAttempts
      .filter((a) => a.status === "submitted")
      .reduce((sum, a) => sum + (a.score / (a.total_marks || 1)) * 100, 0);

    const averagePercentage = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;
    const passRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;

    return {
      totalExams: exams.length,
      publishedExams: exams.filter((e) => e.is_published).length,
      totalSubmissions,
      passedSubmissions,
      failedSubmissions,
      averagePercentage,
      passRate,
      exams,
    };
  },

  async getAdminPlatformStats() {
    const profiles = await this.getProfiles();
    const exams = await this.getExams();
    const localAttempts = getLocalData<ExamAttempt[]>(LS_ATTEMPTS, initialAttempts);

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
      totalAttempts: localAttempts.length,
    };
  },
};
