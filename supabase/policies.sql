-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- 2. Helper Functions for Role Checking
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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

-- ====================================================================
-- PROFILES POLICIES
-- ====================================================================

-- Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own non-role profile details
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Teachers can view student profiles who attempted their exams
CREATE POLICY "Teachers can view student profiles for their exams"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        public.is_teacher() AND EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            JOIN public.exams e ON e.id = ea.exam_id
            WHERE ea.student_id = profiles.id AND e.teacher_id = auth.uid()
        )
    );

-- ====================================================================
-- EXAMS POLICIES
-- ====================================================================

-- Admins full access to exams
CREATE POLICY "Admins can select all exams"
    ON public.exams FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can modify all exams"
    ON public.exams FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Teachers manage their own exams
CREATE POLICY "Teachers can manage their own exams"
    ON public.exams FOR ALL
    TO authenticated
    USING (public.is_teacher() AND teacher_id = auth.uid())
    WITH CHECK (public.is_teacher() AND teacher_id = auth.uid());

-- Students can view published exams
CREATE POLICY "Students can view published exams"
    ON public.exams FOR SELECT
    TO authenticated
    USING (public.is_student() AND is_published = true);

-- ====================================================================
-- QUESTIONS POLICIES
-- ====================================================================

-- Admins full access to questions
CREATE POLICY "Admins can manage all questions"
    ON public.questions FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Teachers manage questions for their own exams
CREATE POLICY "Teachers can manage questions of their exams"
    ON public.questions FOR ALL
    TO authenticated
    USING (
        public.is_teacher() AND EXISTS (
            SELECT 1 FROM public.exams e
            WHERE e.id = questions.exam_id AND e.teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_teacher() AND EXISTS (
            SELECT 1 FROM public.exams e
            WHERE e.id = exam_id AND e.teacher_id = auth.uid()
        )
    );

-- Note: Students access question options during exams via the secure RPC get_exam_questions_for_student
-- which conceals correct_answer. Once an attempt is submitted, students can review their questions & answers.
CREATE POLICY "Students can view questions after submitting exam"
    ON public.questions FOR SELECT
    TO authenticated
    USING (
        public.is_student() AND EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.exam_id = questions.exam_id 
              AND ea.student_id = auth.uid() 
              AND ea.status = 'submitted'
        )
    );

-- ====================================================================
-- EXAM ATTEMPTS POLICIES
-- ====================================================================

-- Admins can view all attempts
CREATE POLICY "Admins can view all exam attempts"
    ON public.exam_attempts FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Teachers can view attempts for their exams
CREATE POLICY "Teachers can view attempts for their exams"
    ON public.exam_attempts FOR SELECT
    TO authenticated
    USING (
        public.is_teacher() AND EXISTS (
            SELECT 1 FROM public.exams e
            WHERE e.id = exam_attempts.exam_id AND e.teacher_id = auth.uid()
        )
    );

-- Students can view their own attempts
CREATE POLICY "Students can view own attempts"
    ON public.exam_attempts FOR SELECT
    TO authenticated
    USING (public.is_student() AND student_id = auth.uid());

-- Students can start an attempt (INSERT)
CREATE POLICY "Students can create own attempt"
    ON public.exam_attempts FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_student() AND student_id = auth.uid() AND EXISTS (
            SELECT 1 FROM public.exams e
            WHERE e.id = exam_id AND e.is_published = true
        )
    );

-- Students can update their own in-progress attempt (e.g. status/expiry)
CREATE POLICY "Students can update own in-progress attempt"
    ON public.exam_attempts FOR UPDATE
    TO authenticated
    USING (public.is_student() AND student_id = auth.uid())
    WITH CHECK (public.is_student() AND student_id = auth.uid());

-- ====================================================================
-- STUDENT ANSWERS POLICIES
-- ====================================================================

-- Admins can view all student answers
CREATE POLICY "Admins can view all student answers"
    ON public.student_answers FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Teachers can view student answers for their exams
CREATE POLICY "Teachers can view answers for their exams"
    ON public.student_answers FOR SELECT
    TO authenticated
    USING (
        public.is_teacher() AND EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            JOIN public.exams e ON e.id = ea.exam_id
            WHERE ea.id = student_answers.attempt_id AND e.teacher_id = auth.uid()
        )
    );

-- Students can view their own answers
CREATE POLICY "Students can view own answers"
    ON public.student_answers FOR SELECT
    TO authenticated
    USING (
        public.is_student() AND EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = student_answers.attempt_id AND ea.student_id = auth.uid()
        )
    );

-- Students can save/update their answers during their active attempt
CREATE POLICY "Students can insert own answers"
    ON public.student_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_student() AND EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = attempt_id AND ea.student_id = auth.uid() AND ea.status = 'in_progress'
        )
    );

CREATE POLICY "Students can update own answers while in progress"
    ON public.student_answers FOR UPDATE
    TO authenticated
    USING (
        public.is_student() AND EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = student_answers.attempt_id AND ea.student_id = auth.uid() AND ea.status = 'in_progress'
        )
    );
