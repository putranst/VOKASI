-- Dual Instructor System Implementation
-- Part 2: Data Migration & Demo Accounts

-- ============================================
-- STEP 1: Update Mats Hanson to Professor
-- ============================================

-- Convert Mats to Professor role
UPDATE public.users
SET role = 'professor',
    instructor_type = 'institutional',
    affiliated_institution_id = (SELECT id FROM public.institutions WHERE short_name = 'UID'),
    employment_status = 'full_time',
    employment_start_date = '2024-01-01'
WHERE email = 'mats@uid.or.id';

-- Update Mats' courses to institutional type
UPDATE public.courses
SET instructor_type = 'institutional',
    status = 'published',
    approved_at = now()
WHERE instructor = 'Mats Hanson';

-- Verify Mats update
SELECT id, email, full_name, role, instructor_type, affiliated_institution_id
FROM public.users
WHERE email = 'mats@uid.or.id';

-- ============================================
-- STEP 2: Create Institution Admin for UID
-- ============================================

-- Note: Create this user via Supabase Auth UI first with:
-- Email: admin@uid.or.id
-- Password: password123
-- Metadata: {"full_name": "Dr. Sarah Admin", "role": "institution_admin"}

-- Then run this to add to institution_staff:
-- (Replace UUID with actual auth user ID after creation)

-- INSERT INTO public.institution_staff (user_id, institution_id, role, permissions)
-- SELECT id, (SELECT id FROM public.institutions WHERE short_name = 'UID'), 'admin', '{}'::jsonb
-- FROM public.users
-- WHERE email = 'admin@uid.or.id';

-- ============================================
-- STEP 3: Prepare for Independent Instructor Account
-- ============================================

-- Note: Create this user via Supabase Auth UI:
-- Email: instructor@freelance.com
-- Password: password123
-- Metadata: {"full_name": "Alex Rivera", "role": "instructor"}

-- Then run this to set instructor type:
UPDATE public.users
SET instructor_type = 'independent',
    affiliated_institution_id = NULL
WHERE email = 'instructor@freelance.com';

-- ============================================
-- STEP 4: Create sample course for independent instructor
-- ============================================

-- Create a course for Alex Rivera (independent instructor)
INSERT INTO public.courses (
    title, 
    instructor, 
    org, 
    institution_id, 
    instructor_type,
    rating, 
    students_count, 
    image, 
    level, 
    category, 
    description,
    status
)
VALUES (
    'Freelance Digital Marketing Mastery',
    'Alex Rivera',
    'Rivera Consulting',
    NULL,  -- No institution
    'independent',
    4.9,
    '312',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    'Intermediate',
    'Marketing',
    'Learn proven strategies for freelance digital marketing success',
    'published'
);

-- ============================================
-- STEP 5: Create sample performance record for Mats
-- ============================================

INSERT INTO public.professor_performance (
    professor_id,
    institution_id,
    period_start,
    period_end,
    total_courses,
    total_students,
    average_course_rating,
    total_reviews_completed,
    average_response_time_hours,
    notes
)
SELECT 
    u.id,
    u.affiliated_institution_id,
    '2024-01-01'::date,
    '2024-06-30'::date,
    2,
    67,
    4.6,
    15,
    24.5,
    'Excellent performance in first semester. Consistently responsive to student needs.'
FROM public.users u
WHERE u.email = 'mats@uid.or.id';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all instructor types
SELECT 
    full_name,
    email,
    role,
    instructor_type,
    affiliated_institution_id,
    employment_status
FROM public.users
WHERE role IN ('instructor', 'professor')
ORDER BY role, full_name;

-- Check courses by type
SELECT 
    title,
    instructor,
    org,
    instructor_type,
    status,
    institution_id
FROM public.courses
ORDER BY instructor_type, title;

-- Check institution staff
SELECT 
    u.full_name,
    u.email,
    ist.role as staff_role,
    i.name as institution_name
FROM public.institution_staff ist
JOIN public.users u ON u.id = ist.user_id
JOIN public.institutions i ON i.id = ist.institution_id;
