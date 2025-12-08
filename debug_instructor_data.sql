-- Debug: Check instructor data issues
-- Run this in Supabase SQL Editor to diagnose

-- 1. Check if we have any professors/instructors
SELECT id, email, full_name, role, instructor_type, affiliated_institution_id
FROM users
WHERE role IN ('instructor', 'professor')
ORDER BY role, full_name;

-- 2. Check if Mats (professor) has courses
SELECT id, title, instructor, instructor_type, status, institution_id
FROM courses
WHERE instructor = 'Mats Hanson';

-- 3. Check if Alex (independent instructor) has courses
SELECT id, title, instructor, instructor_type, status, institution_id  
FROM courses
WHERE instructor = 'Alex Rivera';

-- 4. Check all courses
SELECT id, title, instructor, instructor_type, status
FROM courses
ORDER BY instructor;

-- 5. Check projects for review
SELECT 
  p.id,
  p.title as project_title,
  p.current_phase,
  p.course_id,
  c.title as course_title,
  c.instructor,
  u.full_name as student_name
FROM projects p
JOIN courses c ON c.id = p.course_id
JOIN users u ON u.id = p.user_id
WHERE p.current_phase = 'conceive'
ORDER BY c.instructor;

-- 6. Check RLS policy for courses
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'courses'
ORDER BY policyname;
