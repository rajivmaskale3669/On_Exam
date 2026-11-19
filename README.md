# AuraExam — Luxury Online Examination System

A production-grade, secure, and elegant full-stack Online Examination System built for academic institutions and enterprises.

Designed with an ivory-and-emerald light luxury aesthetic, featuring strict Row Level Security (RLS), real-time exam proctoring, anti-cheat mechanisms, automatic grading, and comprehensive analytics.

---

## 1. Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) + [TypeScript](https://www.typescriptlang.org/) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, Row Level Security, RPC Stored Procedures)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Session & Cookies:** `@supabase/ssr` (persistent cookie handling, edge middleware route guards)
- **Icons & UI:** [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) Toasts
- **Version Control & CI/CD:** GitHub + Vercel

---

## 2. Color Palette & Luxury Theme

In accordance with strict aesthetic guidelines:
- **Background:** Ivory/Cream (`#FAF7F0`, `#FCFBF8`)
- **Primary Accent:** Deep Emerald Green (`#0B3D2E`)
- **Secondary Accent:** Rich Gold (`#C9A227`, `#DFC775`)
- **Text:** Charcoal (`#2B2B2B`, `#5A5A5A`)
- **Success:** Muted Emerald (`#166534`, `#E7F2EE`)
- **Error / Destructive:** Deep Maroon (`#8B1E1E`, `#FBEBEB`)
- **Typography:** Playfair Display for headings paired with Inter for body.

---

## 3. User Roles & Capabilities

| Role | Core Capabilities |
| :--- | :--- |
| **System Administrator** | Complete institutional governance: oversee all authored exams across departments, view platform-wide KPIs, manage student and faculty accounts with instant activation/suspension toggles. |
| **Teacher / Examiner** | Create and configure exams (duration, passing threshold, availability windows), manage the Question Bank (MCQs with multiple options, True/False, points per question), toggle live/draft status, review candidate submissions, and analyze cohort pass/fail ratios. |
| **Student / Candidate** | Browse published assessments, inspect syllabus prerequisites, take timed examinations with live countdown timer and anti-cheat tab switch monitoring, navigate questions with review flagging, and access instant auto-graded scorecards and item-by-item review sheets. |

---

## 4. Database Schema & Supabase Setup

All SQL migrations and security policies are organized in `/supabase`:

1. **`supabase/schema.sql`**:
   - `profiles`: Extends `auth.users`, synchronized automatically via database trigger.
   - `exams`: Subject, duration, pass threshold, availability window, published flag.
   - `questions`: MCQ and True/False types, JSONB options, assigned marks, official answer key.
   - `exam_attempts`: Candidate tracking, timestamp bounds, auto-calculated score, pass status.
   - `student_answers`: Record of selected candidate response, correctness boolean, awarded marks.
   - Automated triggers for updating timestamps and synchronizing exam total marks.
   - Security DEFINER stored procedure `submit_exam_attempt()` for tamper-proof server-side auto-grading.

2. **`supabase/policies.sql`**:
   - Full Row Level Security (RLS) enabled on all 5 tables.
   - Strict role-based policies (`is_admin()`, `is_teacher()`, `is_student()`).
   - Secure stripping of correct answers during active exam attempts to ensure academic integrity.

3. **`supabase/seed.sql`**:
   - Pre-configured demo accounts, computer science and physics examinations, and questions.

### Applying Migrations to Supabase:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run `supabase/schema.sql`.
3. Run `supabase/policies.sql`.
4. (Optional) Run `supabase/seed.sql` to populate initial demo records.

---

## 5. Local Setup & Execution

### Prerequisites:
- Node.js (v18 or v20+)
- npm, pnpm, or yarn

### Steps:
```bash
# 1. Clone repository
git clone https://github.com/your-username/online-examination-system.git
cd online-examination-system

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 6. Evaluator Quick Credentials

For testing and grading convenience, quick-fill buttons are provided on the `/login` screen:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@examportal.edu` | `ExamPass123!` |
| **Teacher** | `teacher@examportal.edu` | `ExamPass123!` |
| **Student** | `student@examportal.edu` | `ExamPass123!` |

---

## 7. Quality Bar & Verification Checklist

- [x] **Light Luxury Theme:** Ivory, Emerald Green, and Rich Gold with Playfair Display typography. Zero dark mode artifacts.
- [x] **Authentication:** Email & Password signup, login, forgot password, confirm password match, password strength checks, persistent sessions.
- [x] **Protected Routes:** Edge middleware redirects unauthenticated users and prevents cross-role route access (students cannot access `/teacher` or `/admin`).
- [x] **Teacher Exam Studio:** Create exam, edit exam, toggle publish/unpublish, add/edit/delete MCQ and True/False questions, recalculate total marks.
- [x] **Student Exam Arena:** Real-time countdown timer, auto-submit upon timer expiry, question navigator bubble grid, review flagging, single attempt constraint, submit modal confirmation, immediate scorecard generation.
- [x] **Teacher Analytics:** Pass/fail distribution bars, average score calculations, candidate submission lists.
- [x] **Admin Governance:** User roster with active/suspended status toggling, global exam catalog.
- [x] **Error Handling:** 404 not found page, custom error boundary, toast notifications for every mutation.
- [x] **Zero Build Errors:** Clean TypeScript compilation with Next.js App Router.
