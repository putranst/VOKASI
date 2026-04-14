-- Fix Row Level Security for Instructor Dashboard
-- Run this in Supabase SQL Editor

-- Allow instructors to view projects in their courses
CREATE POLICY "Instructors can view projects in their courses"
ON public.projects FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    JOIN public.users ON users.full_name = courses.instructor
    WHERE courses.id = projects.course_id
    AND users.id = auth.uid()
    AND users.role = 'instructor'
  )
);

-- Allow instructors to view project charters for their students
CREATE POLICY "Instructors can view charters in their courses"
ON public.project_charters FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.courses ON courses.id = projects.course_id
    JOIN public.users ON users.full_name = courses.instructor
    WHERE projects.id = project_charters.project_id
    AND users.id = auth.uid()
    AND users.role = 'instructor'
  )
);

-- Allow instructors to view enrollments in their courses
CREATE POLICY "Instructors can view enrollments in their courses"
ON public.enrollments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    JOIN public.users ON users.full_name = courses.instructor
    WHERE courses.id = enrollments.course_id
    AND users.id = auth.uid()
    AND users.role = 'instructor'
  )
);

-- Verify policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('projects', 'project_charters', 'enrollments')
ORDER BY tablename, policyname;
