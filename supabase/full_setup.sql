-- ====================================================================
-- AURAEXAM: PRODUCTION SUPABASE DATABASE SCHEMA (ZERO DUMMY DATA)
-- Project URL: https://nuecfkpumbeuqczmbhzw.supabase.co
-- Run this entire script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nuecfkpumbeuqczmbhzw/sql/new
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. TABLES DDL
-- ====================================================================

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    total_marks INTEGER NOT NULL DEFAULT 0 CHECK (total_marks >= 0),
    pass_percentage NUMERIC NOT NULL DEFAULT 50 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('mcq', 'true_false')),
    marks INTEGER NOT NULL DEFAULT 1 CHECK (marks > 0),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam Attempts Table
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    score NUMERIC NOT NULL DEFAULT 0,
    total_marks INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(exam_id, student_id)
);

-- Student Answers Table
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    marks_awarded NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(attempt_id, question_id)
);

-- ====================================================================
-- 3. TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- ====================================================================

-- Timestamp auto-updater
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_exams_updated_at ON public.exams;
CREATE TRIGGER tr_exams_updated_at BEFORE UPDATE ON public.exams
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_questions_updated_at ON public.questions;
CREATE TRIGGER tr_questions_updated_at BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-sync exam total marks when questions are added/edited/deleted
CREATE OR REPLACE FUNCTION public.sync_exam_total_marks()
RETURNS TRIGGER AS $$
DECLARE
    v_exam_id UUID;
    v_total_marks INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_exam_id := OLD.exam_id;
    ELSE
        v_exam_id := NEW.exam_id;
    END IF;

    SELECT COALESCE(SUM(marks), 0) INTO v_total_marks
    FROM public.questions
    WHERE exam_id = v_exam_id;

    UPDATE public.exams
    SET total_marks = v_total_marks
    WHERE id = v_exam_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_exam_total_marks ON public.questions;
CREATE TRIGGER tr_sync_exam_total_marks AFTER INSERT OR UPDATE OR DELETE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.sync_exam_total_marks();

-- Automatically create profile when a user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_full_name TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    IF user_role NOT IN ('admin', 'teacher', 'student') THEN
        user_role := 'student';
    END IF;

    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    INSERT INTO public.profiles (id, full_name, email, role, is_active)
    VALUES (NEW.id, user_full_name, NEW.email, user_role, true)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Securely fetch exam questions for taking an exam (strips correct_answer)
CREATE OR REPLACE FUNCTION public.get_exam_questions_for_student(p_exam_id UUID)
RETURNS TABLE (
    id UUID,
    exam_id UUID,
    question_text TEXT,
    type TEXT,
    marks INTEGER,
    options JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.exam_id, q.question_text, q.type, q.marks, q.options
    FROM public.questions q
    WHERE q.exam_id = p_exam_id
    ORDER BY q.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Server-side auto-grading RPC (evaluates answers securely)
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(
    p_attempt_id UUID,
    p_answers JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_attempt RECORD;
    v_exam RECORD;
    v_q RECORD;
    v_item JSONB;
    v_q_id UUID;
    v_selected TEXT;
    v_is_correct BOOLEAN;
    v_marks_awarded NUMERIC;
    v_total_score NUMERIC := 0;
    v_total_marks INTEGER := 0;
    v_pass_percentage NUMERIC;
    v_passed BOOLEAN := false;
BEGIN
    SELECT * INTO v_attempt FROM public.exam_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Exam attempt not found.';
    END IF;

    IF v_attempt.status = 'submitted' THEN
        RAISE EXCEPTION 'Exam has already been submitted.';
    END IF;

    SELECT * INTO v_exam FROM public.exams WHERE id = v_attempt.exam_id;
    v_total_marks := v_exam.total_marks;
    v_pass_percentage := v_exam.pass_percentage;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_q_id := (v_item->>'question_id')::UUID;
        v_selected := v_item->>'selected_answer';

        SELECT * INTO v_q FROM public.questions WHERE id = v_q_id AND exam_id = v_exam.id;

        IF FOUND THEN
            IF v_selected IS NOT NULL AND trim(v_selected) = trim(v_q.correct_answer) THEN
                v_is_correct := true;
                v_marks_awarded := v_q.marks;
                v_total_score := v_total_score + v_marks_awarded;
            ELSE
                v_is_correct := false;
                v_marks_awarded := 0;
            END IF;

            INSERT INTO public.student_answers (attempt_id, question_id, selected_answer, is_correct, marks_awarded)
            VALUES (p_attempt_id, v_q_id, v_selected, v_is_correct, v_marks_awarded)
            ON CONFLICT (attempt_id, question_id) DO UPDATE
            SET selected_answer = EXCLUDED.selected_answer,
                is_correct = EXCLUDED.is_correct,
                marks_awarded = EXCLUDED.marks_awarded;
        END IF;
    END LOOP;

    IF v_total_marks > 0 THEN
        IF (v_total_score / v_total_marks * 100) >= v_pass_percentage THEN
            v_passed := true;
        END IF;
    ELSE
        v_passed := true;
    END IF;

    UPDATE public.exam_attempts
    SET submitted_at = now(),
        score = v_total_score,
        total_marks = v_total_marks,
        passed = v_passed,
        status = 'submitted'
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'success', true,
        'attempt_id', p_attempt_id,
        'score', v_total_score,
        'total_marks', v_total_marks,
        'passed', v_passed
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Exams Policies
DROP POLICY IF EXISTS "Admins can select all exams" ON public.exams;
CREATE POLICY "Admins can select all exams" ON public.exams FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can modify all exams" ON public.exams;
CREATE POLICY "Admins can modify all exams" ON public.exams FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers can manage their own exams" ON public.exams;
CREATE POLICY "Teachers can manage their own exams" ON public.exams FOR ALL TO authenticated
USING (public.is_teacher() AND teacher_id = auth.uid())
WITH CHECK (public.is_teacher() AND teacher_id = auth.uid());

DROP POLICY IF EXISTS "Students can view published exams" ON public.exams;
CREATE POLICY "Students can view published exams" ON public.exams FOR SELECT TO authenticated
USING (public.is_student() AND is_published = true);

-- Questions Policies
DROP POLICY IF EXISTS "Admins can manage all questions" ON public.questions;
CREATE POLICY "Admins can manage all questions" ON public.questions FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers can manage questions of their exams" ON public.questions;
CREATE POLICY "Teachers can manage questions of their exams" ON public.questions FOR ALL TO authenticated
USING (
    public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.exams e WHERE e.id = questions.exam_id AND e.teacher_id = auth.uid()
    )
)
WITH CHECK (
    public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.teacher_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Students can view questions after submitting exam" ON public.questions;
CREATE POLICY "Students can view questions after submitting exam" ON public.questions FOR SELECT TO authenticated
USING (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.exam_attempts ea
        WHERE ea.exam_id = questions.exam_id AND ea.student_id = auth.uid() AND ea.status = 'submitted'
    )
);

-- Exam Attempts Policies
DROP POLICY IF EXISTS "Admins can view all exam attempts" ON public.exam_attempts;
CREATE POLICY "Admins can view all exam attempts" ON public.exam_attempts FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers can view attempts for their exams" ON public.exam_attempts;
CREATE POLICY "Teachers can view attempts for their exams" ON public.exam_attempts FOR SELECT TO authenticated
USING (
    public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.exams e WHERE e.id = exam_attempts.exam_id AND e.teacher_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Students can view own attempts" ON public.exam_attempts;
CREATE POLICY "Students can view own attempts" ON public.exam_attempts FOR SELECT TO authenticated
USING (public.is_student() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can create own attempt" ON public.exam_attempts;
CREATE POLICY "Students can create own attempt" ON public.exam_attempts FOR INSERT TO authenticated
WITH CHECK (
    public.is_student() AND student_id = auth.uid() AND EXISTS (
        SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.is_published = true
    )
);

DROP POLICY IF EXISTS "Students can update own in-progress attempt" ON public.exam_attempts;
CREATE POLICY "Students can update own in-progress attempt" ON public.exam_attempts FOR UPDATE TO authenticated
USING (public.is_student() AND student_id = auth.uid())
WITH CHECK (public.is_student() AND student_id = auth.uid());

-- Student Answers Policies
DROP POLICY IF EXISTS "Admins can view all student answers" ON public.student_answers;
CREATE POLICY "Admins can view all student answers" ON public.student_answers FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers can view answers for their exams" ON public.student_answers;
CREATE POLICY "Teachers can view answers for their exams" ON public.student_answers FOR SELECT TO authenticated
USING (
    public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.exam_attempts ea
        JOIN public.exams e ON e.id = ea.exam_id
        WHERE ea.id = student_answers.attempt_id AND e.teacher_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Students can view own answers" ON public.student_answers;
CREATE POLICY "Students can view own answers" ON public.student_answers FOR SELECT TO authenticated
USING (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.exam_attempts ea WHERE ea.id = student_answers.attempt_id AND ea.student_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Students can insert own answers" ON public.student_answers;
CREATE POLICY "Students can insert own answers" ON public.student_answers FOR INSERT TO authenticated
WITH CHECK (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.exam_attempts ea WHERE ea.id = attempt_id AND ea.student_id = auth.uid() AND ea.status = 'in_progress'
    )
);

DROP POLICY IF EXISTS "Students can update own answers while in progress" ON public.student_answers;
CREATE POLICY "Students can update own answers while in progress" ON public.student_answers FOR UPDATE TO authenticated
USING (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.exam_attempts ea WHERE ea.id = student_answers.attempt_id AND ea.student_id = auth.uid() AND ea.status = 'in_progress'
    )
);

-- ====================================================================
-- 5. REALTIME REPLICATION CONFIGURATION
-- Enables live Supabase Realtime pub/sub for instant UI reactivity
-- ====================================================================

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.exams;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_attempts;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;
END $$;
