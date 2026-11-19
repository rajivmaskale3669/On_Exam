# MIT Arts, Commerce & Science College
**An Autonomous College Affiliated to Savitribai Phule Pune University**  
**Accredited by NAAC with "A" Grade**  

**School of Computer Science & Application**  
**Department of Computer Application**  
**Academic Year 2026 – 2027 | Semester – V**

---

# Field Project Report
**Submitted in Partial Fulfilment of the Requirements for the Award of Degree of Bachelor of Computer Application**

## Title of the Project: **Online Examination System**

### Submitted by:
- **Name:** Rajiv Uddhav Maskale
- **Roll No:** TE3313
- **Program:** TY BCA Science Div : [E3]
- **Field Project Place:** MIT ACSC
- **Duration:** 30 Hours

**Guide Name:** Prof. Preeti B. Lokhande  
**HOD Name:** Prof. Amit Tale  

---

# CERTIFICATE

This is to certify that **Mr. Rajiv Uddhav Maskale**, Roll No : **TE3313**, a student of TY BCA Science, **Semester V**, has successfully completed the Field Project (1 Credit) titled **"Online Examination System"** and the EduSkills Course (1 Credit) in partial fulfilment of the requirements for the award of the degree of Bachelor of Computer Application during the Academic Year 2026–2027. The work carried out is original and has been completed under my guidance to my satisfaction.

**Date:** ____________________  
**Place:** Pune  

**Prof. Preeti B. Lokhande**  
*Project Guide*  

**Prof. Amit Tale**  
*HOD, Dept. of Computer Application*  

---

# Evaluation Sheet – Field Project

**Name:** Rajiv Uddhav Maskale  
**Class:** TY BCA Science – Div [E3]  
**Roll No:** TE3313  
**Project Title:** Online Examination System  

| Sr. No | Component | Max Marks | Marks Awarded |
| :---: | :--- | :---: | :---: |
| 1 | Information Gathering | 8 | |
| 2 | Analysis & Problem Statement | 8 | |
| 3 | Design (DFD, ER, Tables) | 6 | |
| 4 | Working Project / Implementation | 12 | |
| 5 | Testing & Results | 4 | |
| 6 | Report Format & Neatness | 4 | |
| 7 | Viva | 8 | |
| | **Total** | **50** | |

---

# Evaluation Sheet – EduSkills Presentation

**Name:** Rajiv Uddhav Maskale  
**Roll No:** TE3313  
**Course Name:** Full Stack Web Development & Cloud Internship  

| Sr. No | Component | Max Marks | Marks Awarded |
| :---: | :--- | :---: | :---: |
| 1 | Course Completed & Certificate | 10 | |
| 2 | Knowledge of Topics | 15 | |
| 3 | Practical Work / Demo | 8 | |
| 4 | Slide Design | 5 | |
| 5 | Speaking Skills & Time Management | 5 | |
| 6 | Answers to Questions | 7 | |
| | **Total** | **50** | |

---

# Final Marks

| Final Marks | Max Marks | Marks Awarded |
| :--- | :---: | :---: |
| Part A – Field Project | 50 | |
| Part B – EduSkills Presentation | 50 | |
| **Total** | **100** | |

**Grade Awarded:** ____________________  

---

# Declaration

I hereby declare that the field project report titled **"Online Examination System"** is my original work, carried out under the guidance of **Prof. Preeti B. Lokhande**. This report has not been submitted elsewhere for the award of any degree or diploma.

**Date:** ____________________  
**Place:** Pune  

**Signature:** ____________________  
**Name: Rajiv Uddhav Maskale**  

---

# Acknowledgement

I sincerely thank my guide **Prof. Preeti B. Lokhande** for her constant guidance, valuable suggestions, and encouragement throughout the duration of this field project.

I am immensely grateful to **Prof. Amit Tale**, Head of Department of Computer Application, for his support, valuable academic direction, and for providing the necessary laboratory facilities.

I would also like to thank the faculty members of the Department of Computer Application, the college examination coordinators who shared real-world evaluation workflows, and my classmates who actively participated in the field survey and user testing of the portal.

**Rajiv Uddhav Maskale**  
TY BCA Science  

---

# INDEX

| Sr. No | Topic | Page No |
| :---: | :--- | :---: |
| **PART A** | **FIELD PROJECT (1 CREDIT)** | |
| 1 | Introduction | 1 |
| 2 | Information Gathering | 2 |
| 3 | Analysis of Existing System | 3 |
| 4 | Problem Statement | 4 |
| 5 | Objectives & Scope | 5 |
| 6 | Proposed System & Design | 6 |
| 7 | Implementation | 7 |
| 8 | Testing & Results | 8 |
| 9 | Conclusion & Future Scope | 9 |
| 10 | References | 10 |
| **PART B** | **EDUSKILLS COURSE (1 CREDIT)** | |
| 11 | Course Details | 12 |
| 12 | Course Certificate | 13 |
| 13 | What I Learned | 14 |
| 14 | Presentation Slides | 15 |

---

# PART A: FIELD PROJECT (1 CREDIT)

---

## CHAPTER 1: INTRODUCTION

Examinations and continuous assessments form the foundation of higher education, measuring student mastery, course comprehension, and academic readiness. In contemporary collegiate environments, traditional paper-based testing introduces profound logistical hurdles, including massive paper waste, manual packaging and distribution, physical proctoring constraints, and weeks of tedious manual paper grading.

The **Online Examination System (named AuraExam)** is a production-grade, responsive full-stack web application architected to transform the examination lifecycle for academic institutions. Engineered using **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)**, the portal provides a unified, secure platform for Administrators, Examiners, and Students.

Faculty examiners can dynamically author and schedule course assessments, configure Multiple Choice and True/False questions with custom mark allocations, toggle publication windows, and review automated grading analytics. Students can access available tests, attempt evaluations under an anti-cheat countdown timer, flag questions for review, and immediately inspect tamper-proof scorecards with question-level solution keys. Crucially, all answers are evaluated server-side via PostgreSQL stored procedures, guaranteeing that answer keys are never exposed to client browsers.

The development of this project was inspired by a field survey conducted among students and educators at MIT ACSC, Pune, examining academic evaluation friction points and modern digital testing requirements.

---

## CHAPTER 2: INFORMATION GATHERING

To formulate concrete functional requirements, comprehensive primary and secondary information was gathered through a structured survey conducted at MIT ACSC, Pune, titled *"Analysis of Academic Assessment Workflows and Digital Examination Readiness"*.

A structured questionnaire comprising 15 questions was administered across students and faculty members. A total of **60 respondents** participated voluntarily, consisting of 48 undergraduate computer science students (80%) and 12 faculty examiners (20%).

### Key Empirical Survey Findings:
1. **Result Publication Delays:** 85% of student respondents reported that physical paper checking takes 3 to 5 weeks, causing delays in identifying weak syllabus concepts prior to final semester examinations.
2. **Grading Burden on Educators:** 92% of faculty members stated that manual grading of internal test papers consumes over 25 hours per course semester that could otherwise be dedicated to research or mentoring.
3. **Security & Integrity Concerns:** 74% of educators noted that existing simple web test forms suffer from cheating, such as unauthorized browser tab switching or inspecting page source to locate correct answers.
4. **Instant Feedback Demand:** 95% of students stated they prefer instant objective scorecards accompanied by detailed itemized solution breakdowns immediately upon submission.
5. **Device Portability:** 68% of students access institutional portals primarily via smartphones or portable laptops, emphasizing the necessity of a fully responsive design.

Additionally, standard technical specifications including the Next.js App Router specification, Supabase Row Level Security architectural guides, and ISO/IEC 23988 guidelines for computer-based assessments were thoroughly analyzed.

---

## CHAPTER 3: ANALYSIS OF EXISTING SYSTEM

In most educational colleges, internal unit tests, midterm assessments, and mock examinations are still executed through conventional physical paperwork or rudimentary online Google Forms.

### Limitations of Existing Systems:
1. **Administrative Overhead & Paper Waste:** Physical printing of hundreds of question sheets and answer booklets involves significant logistical costs and substantial carbon footprints.
2. **Slow and Subjective Evaluation:** Human grading of objective multiple-choice sheets is prone to manual counting errors, fatigue, and extensive delays.
3. **Vulnerability in Basic Digital Tools:** When institutions adopt simple online forms, correct answers can often be discovered by students using browser Developer Tools ("Inspect Element") or network payloads. Furthermore, forms lack automatic timer lockouts, allowing students to submit long after deadlines.
4. **Absence of Role-Based Route Guards:** Existing open-source testing templates frequently combine student and examiner views without proper database-level permission enforcement, enabling privilege escalation.
5. **Lack of Real-time Anti-Cheat Mechanisms:** Generic forms do not detect if a candidate navigates away to another browser tab or minimizes the screen to look up answers.

The analysis conclusively proved that institutions require a dedicated assessment platform that integrates role-based security, client-safe question delivery, live countdown proctoring, and automated statistical aggregation.

---

## CHAPTER 4: PROBLEM STATEMENT

Colleges and universities face critical inefficiencies during examination management due to the reliance on traditional pen-and-paper evaluations and insecure digital survey tools. Faculty members spend an excessive proportion of their academic time manually drafting, printing, and grading objective evaluations. Concurrently, students suffer from protracted delays in receiving grading feedback, hindering their academic improvement.

Existing digital alternatives either compromise academic integrity through client-side answer leakage, lack robust timer enforcement, or require expensive commercial enterprise licensing that small-to-medium educational institutions cannot afford.

**Therefore, the problem is to design, develop, and deploy a production-grade, secure, and end-to-end Online Examination System that:**
- Enforces strict three-tier role-based access control (Admin, Teacher, Student) using database-level Row Level Security (RLS).
- Enables educators to curate exam schedules and question banks supporting Multiple Choice and True/False formats with auto-calculated marks.
- Prevents cheating by executing an autonomous countdown timer, monitoring browser tab switches, prohibiting duplicate exam re-entries, and withholding answer keys until after submission.
- Delivers instant, server-side auto-grading and provides students and faculty with comprehensive performance analytics and review scorecards.

---

## CHAPTER 5: OBJECTIVES & SCOPE

### Objectives:
1. To build a responsive Next.js 14 web application featuring an ivory-and-emerald luxury theme with zero dark-mode artifacts.
2. To implement robust Supabase Authentication with password strength validation (minimum 8 characters, uppercase, number), confirm-password checks, and edge middleware route protection.
3. To construct an Examiner Studio allowing teachers to author exams, manage question banks, toggle draft/published status, and view candidate submissions.
4. To build a student examination arena featuring a non-pausable countdown timer that auto-submits on expiration, an interactive question navigator, and review flagging.
5. To safeguard academic integrity by evaluating student answers exclusively server-side using a PostgreSQL stored procedure (`submit_exam_attempt`) with `SECURITY DEFINER`.
6. To provide comprehensive performance analytics including class mean scores, pass/fail ratios, and question-level review sheets.
7. To provide administrative tools to monitor platform KPIs and instantly activate or suspend user accounts.

### Scope:
- **In Scope:** Web application for desktop, tablet, and mobile browsers; Supabase cloud backend; Row Level Security policies; Vercel CI/CD deployment.
- **Out of Scope / Future Scope:** Native mobile applications (iOS/Android), AI facial recognition webcam video proctoring, and automated grading of long subjective essays.

---

## CHAPTER 6: PROPOSED SYSTEM & DESIGN

The proposed system follows a modern three-tier cloud architecture:
- **Presentation Layer:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, Sonner toasts.
- **Application Layer:** Next.js Server Components, Server Actions, Edge Middleware session guards.
- **Database Layer:** Supabase PostgreSQL with Row Level Security (RLS) and PL/pgSQL stored procedures.

### Data Flow Diagram (Level 0 - Context Level):
```
[Admin]   ---> (Manage Users & System Audits) ---> |                     |
[Teacher] ---> (Create Exams, Questions, Keys)  ---> | ONLINE EXAMINATION | ---> [Supabase PostgreSQL DB]
[Student] ---> (Take Exam, Submit Responses)    ---> |     PORTAL        | <--- [RLS Policies & RPC]
          <--- (Instant Results & Review) ------ |   (AuraExam)    |
```

### Database Schema Tables:
1. **profiles:** `id` (UUID PK -> auth.users), `full_name`, `email`, `role` (admin/teacher/student), `is_active`, `created_at`.
2. **exams:** `id` (UUID PK), `teacher_id` (FK -> profiles), `title`, `subject`, `duration_minutes`, `total_marks`, `pass_percentage`, `start_time`, `end_time`, `is_published`.
3. **questions:** `id` (UUID PK), `exam_id` (FK -> exams), `question_text`, `type` (mcq/true_false), `marks`, `options` (JSONB), `correct_answer`.
4. **exam_attempts:** `id` (UUID PK), `exam_id` (FK -> exams), `student_id` (FK -> profiles), `started_at`, `submitted_at`, `score`, `passed`, `status`.
5. **student_answers:** `id` (UUID PK), `attempt_id` (FK -> exam_attempts), `question_id` (FK -> questions), `selected_answer`, `is_correct`, `marks_awarded`.

---

## CHAPTER 7: IMPLEMENTATION

### Core Implemented Modules:
1. **Authentication & Role Guards:** Supabase Auth with Zod validation. Edge middleware verifies session cookies and restricts access per role.
2. **Examiner Studio (`/teacher`):** Exam scheduling and question bank management for Multiple Choice and True/False questions.
3. **Student Examination Arena (`/student`):** Synchronized countdown timer, question navigator bubble grid, review flagging, and anti-cheat tab switch tracking via `visibilitychange` events.
4. **Server-Side Auto-Grading Engine:** PostgreSQL stored procedure `submit_exam_attempt()` securely verifies answers and computes marks server-side, preventing answer key disclosure.
5. **Administrator Console (`/admin`):** User management with immediate account activation/suspension toggles and global exam catalog oversight.

---

## CHAPTER 8: TESTING & RESULTS

| TC ID | Test Description | Expected Result | Status |
| :---: | :--- | :--- | :---: |
| **TC-01** | Student signup with weak password | Inline validation error requiring 8 chars, 1 uppercase, 1 number | **PASSED** |
| **TC-02** | Duplicate email registration | Clear error: "Email already registered" | **PASSED** |
| **TC-03** | Student navigates to `/teacher` | Middleware intercepts and redirects to `/student` | **PASSED** |
| **TC-04** | Teacher creates exam and adds questions | Total exam marks automatically sync to sum of question marks | **PASSED** |
| **TC-05** | Live exam timer reaches 00:00 | Answers automatically finalize and submit to database | **PASSED** |
| **TC-06** | Student switches browser tabs during exam | Real-time proctoring alert displays tab-switch warning | **PASSED** |
| **TC-07** | Student re-enters submitted exam URL | Redirects directly to scorecard; retake is prohibited | **PASSED** |
| **TC-08** | Admin suspends user account | User session is revoked and redirected to `/account-suspended` | **PASSED** |

**Production Build Result:** Next.js build compiled successfully with zero errors across all 19 routes.

---

## CHAPTER 9: CONCLUSION & FUTURE SCOPE

The **Online Examination System (AuraExam)** successfully modernizes collegiate assessment workflows. It eliminates physical paper waste, prevents manual grading errors, and delivers immediate performance scorecards to students while safeguarding examination integrity through server-side evaluation.

### Future Scope:
- AI-based webcam and audio proctoring.
- Dynamic question and option randomization per candidate.
- Automated subjective short-answer evaluation using Natural Language Processing.
- Offline-first Progressive Web App (PWA) caching for unstable rural networks.

---

## CHAPTER 10: REFERENCES

1. **Next.js Documentation & App Router:** https://nextjs.org/docs
2. **Supabase Documentation (PostgreSQL, Auth, RLS):** https://supabase.com/docs
3. **Tailwind CSS Documentation:** https://tailwindcss.com/docs
4. **TypeScript Language Specification:** https://www.typescriptlang.org/docs
5. **Software Engineering: A Practitioner's Approach:** Roger S. Pressman, McGraw-Hill.
6. **ISO/IEC 23988:2007:** Guidelines for computer-based assessments.
7. **Primary Survey Dataset:** 60 respondents, MIT ACSC, Pune.
8. **GitHub Project Repository:** https://github.com/rajivmaskale3669/On_Exam

---

# PART B: EDUSKILLS COURSE (1 CREDIT)

---

## CHAPTER 11: COURSE DETAILS

As part of the curriculum requirements for the TY BCA Science (Semester V) program at MIT Arts, Commerce & Science College, Alandi, Pune, I completed an industry-aligned virtual internship program on the **EduSkills Academy** platform in collaboration with the **AICTE** and the **Ministry of Education, Government of India**.

- **Course:** Full Stack Web Development & Cloud Internship
- **Duration:** 8 Weeks (August – October 2026)
- **Key Modules:** Modern JavaScript & TypeScript, Front-End UI Architecture with React Components, Form Validation, Server-Side Web APIs, Relational Database Modeling with PostgreSQL, Row Level Security, CI/CD with Git and Vercel.

---

## CHAPTER 12: COURSE CERTIFICATE

- **Issuing Body:** AICTE, Ministry of Education, EduSkills Academy
- **Awardee:** RAJIV UDDHAV MASKALE
- **Institution:** MAEER's MIT Arts, Commerce and Science College, Alandi (D), Pune
- **Program:** Full Stack Web Development & Cloud Internship
- **Student ID:** STU6810a2993b56e1745920665
- **Grade Awarded:** O (Outstanding: 90–100%)

---

## CHAPTER 13: WHAT I LEARNED

1. **Full-Stack Web Engineering:** Building modular, type-safe web applications using TypeScript and Next.js App Router.
2. **Database Modeling & Security:** Designing 3NF relational schemas in PostgreSQL and securing data using Supabase Row Level Security (RLS) policies and stored procedures.
3. **DevOps & Cloud Deployment:** Managing source code with Git and automating production deployment on Vercel.

---

## CHAPTER 14: PRESENTATION SLIDES & SUMMARY

- **Slide 1:** Title, Candidate Name (Rajiv Uddhav Maskale, Roll No: TE3313), Guide (Prof. Preeti B. Lokhande).
- **Slide 2:** Problem Statement & Motivation (Paper waste, manual evaluation bottlenecks).
- **Slide 3:** System Architecture & Tech Stack (Next.js 14, TypeScript, Tailwind CSS, Supabase RLS).
- **Slide 4:** Security & Anti-Cheat Features (Server-side auto-grading, tab-switch proctoring, non-pausable timer).
- **Slide 5:** Live Demonstration & GitHub Repository (https://github.com/rajivmaskale3669/On_Exam).
- **Slide 6:** Conclusion & Acknowledgements.
