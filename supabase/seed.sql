-- ====================================================================
-- SEED DATA FOR DEMO & TESTING
-- ====================================================================

-- 1. Example Admin, Teacher, and Student profiles
-- Note: Replace UUIDs with actual auth user IDs after initial signup or seeding
INSERT INTO public.profiles (id, full_name, email, role, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'System Administrator', 'admin@examportal.edu', 'admin', true),
    ('22222222-2222-2222-2222-222222222222', 'Prof. Eleanor Vance', 'teacher@examportal.edu', 'teacher', true),
    ('33333333-3333-3333-3333-333333333333', 'Julian Montgomery', 'student@examportal.edu', 'student', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Sample Published Exams
INSERT INTO public.exams (id, teacher_id, title, description, subject, duration_minutes, total_marks, pass_percentage, start_time, end_time, is_published)
VALUES 
    (
        'aaaa1111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'Advanced Algorithms & Data Structures',
        'Comprehensive assessment covering binary search trees, graph algorithms, asymptotic complexity, and dynamic programming fundamentals.',
        'Computer Science',
        45,
        100,
        60,
        now() - interval '2 days',
        now() + interval '30 days',
        true
    ),
    (
        'bbbb2222-2222-2222-2222-222222222222',
        '22222222-2222-2222-2222-222222222222',
        'Classical Mechanics & Thermodynamics',
        'Midterm examination on Newtonian mechanics, energy conservation principles, and the laws of thermodynamics.',
        'Physics',
        60,
        50,
        50,
        now() - interval '1 day',
        now() + interval '14 days',
        true
    ),
    (
        'cccc3333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        'World Literature: The Romantic Era (Draft)',
        'Poetry, essays, and themes of nature and individuality in early 19th-century European literature.',
        'Literature',
        30,
        30,
        70,
        now() + interval '10 days',
        now() + interval '20 days',
        false
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Questions for Exam 1 (Computer Science)
INSERT INTO public.questions (id, exam_id, question_text, type, marks, options, correct_answer)
VALUES
    (
        'q1111111-1111-1111-1111-111111111111',
        'aaaa1111-1111-1111-1111-111111111111',
        'What is the worst-case time complexity of QuickSort when using a naive pivot selection (e.g., always picking the first element)?',
        'mcq',
        20,
        '["O(n log n)", "O(n)", "O(n²)", "O(log n)"]'::jsonb,
        'O(n²)'
    ),
    (
        'q2222222-2222-2222-2222-222222222222',
        'aaaa1111-1111-1111-1111-111111111111',
        'In a Red-Black Tree, every path from a given node to any of its descendant NIL nodes contains the same number of black nodes.',
        'true_false',
        20,
        '["True", "False"]'::jsonb,
        'True'
    ),
    (
        'q3333333-3333-3333-3333-333333333333',
        'aaaa1111-1111-1111-1111-111111111111',
        'Which algorithm is specifically designed to find the shortest path in a graph with non-negative edge weights?',
        'mcq',
        20,
        '["Prim''s Algorithm", "Dijkstra''s Algorithm", "Bellman-Ford Algorithm", "Kruskal''s Algorithm"]'::jsonb,
        'Dijkstra''s Algorithm'
    ),
    (
        'q4444444-4444-4444-4444-444444444444',
        'aaaa1111-1111-1111-1111-111111111111',
        'Dynamic programming requires overlapping subproblems and optimal substructure.',
        'true_false',
        20,
        '["True", "False"]'::jsonb,
        'True'
    ),
    (
        'q5555555-5555-5555-5555-555555555555',
        'aaaa1111-1111-1111-1111-111111111111',
        'What is the auxiliary space complexity of Breadth-First Search (BFS) on a tree of height h with branching factor b?',
        'mcq',
        20,
        '["O(b^h)", "O(h)", "O(b)", "O(1)"]'::jsonb,
        'O(b^h)'
    )
ON CONFLICT (id) DO NOTHING;
