-- Part 2: Update User Profiles and Add Demo Data
-- Run this AFTER creating auth users

-- ============================================
-- STEP 1: Update public.users with correct names and roles
-- ============================================

UPDATE public.users SET full_name = 'Mats Hanson', role = 'instructor' WHERE email = 'mats@uid.or.id';
UPDATE public.users SET full_name = 'Frank Wright', role = 'student' WHERE email = 'frank@tsea.asia';
UPDATE public.users SET full_name = 'Grace Ho', role = 'student' WHERE email = 'grace@tsea.asia';
UPDATE public.users SET full_name = 'Harry Potter', role = 'student' WHERE email = 'harry@tsea.asia';

-- Verify users updated correctly
SELECT id, email, full_name, role FROM public.users ORDER BY role, email;

-- ============================================
-- STEP 2: Add Enrollments
-- ============================================

-- Frank and Harry in "Advanced Renewable Energy Systems"
INSERT INTO public.enrollments (user_id, course_id, status)
SELECT u.id, c.id, 'active'
FROM public.users u, public.courses c
WHERE u.email = 'frank@tsea.asia' 
  AND c.title = 'Advanced Renewable Energy Systems';

INSERT INTO public.enrollments (user_id, course_id, status)
SELECT u.id, c.id, 'active'
FROM public.users u, public.courses c
WHERE u.email = 'harry@tsea.asia' 
  AND c.title = 'Advanced Renewable Energy Systems';

-- Grace in "Sustainable Urban Planning"
INSERT INTO public.enrollments (user_id, course_id, status)
SELECT u.id, c.id, 'active'
FROM public.users u, public.courses c
WHERE u.email = 'grace@tsea.asia' 
  AND c.title = 'Sustainable Urban Planning';

-- Verify enrollments
SELECT e.id, u.email, u.full_name, c.title, e.status
FROM public.enrollments e
JOIN public.users u ON e.user_id = u.id
JOIN public.courses c ON e.course_id = c.id
ORDER BY u.email;

-- ============================================
-- STEP 3: Add Projects
-- ============================================

-- Frank's Project (Deployment Review - Advanced phase)
WITH new_project AS (
    INSERT INTO public.projects (course_id, user_id, title, current_phase, overall_status, completion_percentage)
    SELECT c.id, u.id, 'Solar Grid Optimization', 'operate', 'in_progress', 95
    FROM public.users u, public.courses c
    WHERE u.email = 'frank@tsea.asia' 
      AND c.title = 'Advanced Renewable Energy Systems'
    RETURNING id
)
INSERT INTO public.project_charters (project_id, problem_statement, success_metrics, target_outcome, difficulty_level, estimated_duration)
SELECT id, 
    'Inefficient solar grid distribution in urban areas.',
    'Improve grid efficiency by 15% and reduce energy waste.',
    'Optimized smart grid controller with real-time monitoring.',
    'Advanced',
    '6 months'
FROM new_project;

-- Grace's Project (Charter Review - Conceive phase) - THIS WILL SHOW IN PENDING REVIEWS
WITH new_project AS (
    INSERT INTO public.projects (course_id, user_id, title, current_phase, overall_status, completion_percentage)
    SELECT c.id, u.id, 'Green Roof Initiative', 'conceive', 'in_progress', 10
    FROM public.users u, public.courses c
    WHERE u.email = 'grace@tsea.asia' 
      AND c.title = 'Sustainable Urban Planning'
    RETURNING id
)
INSERT INTO public.project_charters (project_id, problem_statement, success_metrics, target_outcome, difficulty_level, estimated_duration, reasoning)
SELECT id,
    'Lack of green spaces and urban heat islands in downtown Jakarta.',
    'Convert 5 rooftops to green spaces, reduce local temperature by 2°C.',
    'Community-driven rooftop garden network with sustainability workshops.',
    'Beginner',
    '3 months',
    'AI Analysis: Highly feasible with community support and available resources.'
FROM new_project;

-- Harry's Project (Active Design phase)
WITH new_project AS (
    INSERT INTO public.projects (course_id, user_id, title, current_phase, overall_status, completion_percentage)
    SELECT c.id, u.id, 'Wind Turbine Blade Design', 'design', 'in_progress', 45
    FROM public.users u, public.courses c
    WHERE u.email = 'harry@tsea.asia' 
      AND c.title = 'Advanced Renewable Energy Systems'
    RETURNING id
)
INSERT INTO public.project_charters (project_id, problem_statement, success_metrics, target_outcome, difficulty_level, estimated_duration)
SELECT id,
    'Current wind turbine blades are inefficient in low-wind conditions.',
    'Increase energy capture by 20% in winds below 15 km/h.',
    'Prototype of aerodynamic blade design optimized for low-wind environments.',
    'Intermediate',
    '4 months'
FROM new_project;

-- ============================================
-- FINAL VERIFICATION
-- ============================================

-- Show all data counts
SELECT 
    (SELECT COUNT(*) FROM public.institutions) as institutions,
    (SELECT COUNT(*) FROM public.users) as users,
    (SELECT COUNT(*) FROM public.courses) as courses,
    (SELECT COUNT(*) FROM public.enrollments) as enrollments,
    (SELECT COUNT(*) FROM public.projects) as projects,
    (SELECT COUNT(*) FROM public.project_charters) as charters;

-- Show Mats Hanson's courses and student projects
SELECT 
    c.id as course_id,
    c.title as course,
    c.students_count,
    p.id as project_id,
    p.title as project,
    p.current_phase,
    u.full_name as student,
    CASE WHEN pc.id IS NOT NULL AND p.current_phase = 'conceive' THEN 'Pending Review' ELSE 'In Progress' END as status
FROM public.courses c
LEFT JOIN public.projects p ON p.course_id = c.id
LEFT JOIN public.users u ON p.user_id = u.id
LEFT JOIN public.project_charters pc ON pc.project_id = p.id
WHERE c.instructor = 'Mats Hanson'
ORDER BY c.id, p.id;
