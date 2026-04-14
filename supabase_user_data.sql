-- TSEA-X User Data Script (Part 2 - Run AFTER creating auth users)
-- This script adds enrollments, projects, and charters
-- Requires: Auth users to be created first via Supabase Auth UI

-- Instructions:
-- 1. Create users via Supabase Dashboard → Authentication → Users
-- 2. Get their UUIDs from the auth.users table
-- 3. Replace the UUIDs below with actual values
-- 4. Run this script

-- ============================================
-- REPLACE THESE UUIDs WITH ACTUAL VALUES FROM AUTH.USERS
-- ============================================
-- After creating users in Supabase Auth, run this query to get UUIDs:
-- SELECT id, email FROM auth.users;

-- Then replace below:
DO $$
DECLARE
    mats_id uuid := 'REPLACE_WITH_MATS_UUID';
    frank_id uuid := 'REPLACE_WITH_FRANK_UUID';
    grace_id uuid := 'REPLACE_WITH_GRACE_UUID';
    harry_id uuid := 'REPLACE_WITH_HARRY_UUID';
    
    course1_id bigint;
    course2_id bigint;
    
    frank_project_id bigint;
    grace_project_id bigint;
    harry_project_id bigint;
BEGIN
    -- Get course IDs
    SELECT id INTO course1_id FROM public.courses WHERE title = 'Advanced Renewable Energy Systems';
    SELECT id INTO course2_id FROM public.courses WHERE title = 'Sustainable Urban Planning';
    
    -- Insert Enrollments
    INSERT INTO public.enrollments (user_id, course_id, status) VALUES
    (frank_id, course1_id, 'active'),
    (harry_id, course1_id, 'active'),
    (grace_id, course2_id, 'active');
    
    -- Insert Projects
    INSERT INTO public.projects (course_id, user_id, title, current_phase, overall_status, completion_percentage)
    VALUES 
    (course1_id, frank_id, 'Solar Grid Optimization', 'operate', 'in_progress', 95)
    RETURNING id INTO frank_project_id;
    
    INSERT INTO public.projects (course_id, user_id, title, current_phase, overall_status, completion_percentage)
    VALUES 
    (course2_id, grace_id, 'Green Roof Initiative', 'conceive', 'in_progress', 10)
    RETURNING id INTO grace_project_id;
    
    INSERT INTO public.projects (course_id, user_id, title, current_phase, overall_status, completion_percentage)
    VALUES 
    (course1_id, harry_id, 'Wind Turbine Blade Design', 'design', 'in_progress', 45)
    RETURNING id INTO harry_project_id;
    
    -- Insert Charters
    INSERT INTO public.project_charters (project_id, problem_statement, success_metrics, target_outcome, difficulty_level, estimated_duration)
    VALUES 
    (frank_project_id, 
     'Inefficient solar grid distribution.', 
     'Improve efficiency by 15%.', 
     'Optimized grid controller.', 
     'Advanced', '6 months'),
     
    (grace_project_id, 
     'Lack of green spaces in downtown.', 
     'Convert 5 rooftops.', 
     'Community garden network.', 
     'Beginner', '3 months'),
     
    (harry_project_id, 
     'Inefficient turbine blades.', 
     'Increase energy capture by 20%.', 
     'Prototype blade design.', 
     'Intermediate', '4 months');
END $$;
