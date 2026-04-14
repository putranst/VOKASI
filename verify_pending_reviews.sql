-- Quick verification query
-- Run this in Supabase SQL Editor to check if data exists

-- Check projects and their charters
SELECT 
    p.id as project_id,
    p.title as project_title,
    p.current_phase,
    p.course_id,
    u.full_name as student_name,
    c.title as course_title,
    c.instructor,
    pc.id as charter_id,
    CASE 
        WHEN pc.id IS NOT NULL AND p.current_phase = 'conceive' THEN 'SHOULD SHOW IN PENDING'
        ELSE 'NOT PENDING'
    END as review_status
FROM public.projects p
JOIN public.users u ON p.user_id = u.id
JOIN public.courses c ON p.course_id = c.id
LEFT JOIN public.project_charters pc ON pc.project_id = p.id
WHERE c.instructor = 'Mats Hanson'
ORDER BY p.current_phase;
