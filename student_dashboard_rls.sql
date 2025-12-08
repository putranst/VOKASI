-- Student Dashboard RLS Policies
-- Run this in Supabase SQL Editor

-- ============================================
-- Students can view their own enrollments
-- ============================================

CREATE POLICY "Students can view own enrollments"
ON public.enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own enrollments"
ON public.enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Students can view their own projects
-- ============================================

CREATE POLICY "Students can view own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can create own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- Students can view their own credentials
-- ============================================

CREATE POLICY "Students can view own credentials"
ON public.credentials FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- Students can view all published courses
-- ============================================

DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;

CREATE POLICY "Anyone can view published courses"
ON public.courses FOR SELECT
TO authenticated, anon
USING (status = 'published' OR status IS NULL);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('enrollments', 'projects', 'credentials', 'courses')
AND policyname LIKE '%Student%' OR policyname LIKE '%own%' OR policyname LIKE '%publish%'
ORDER BY tablename, policyname;
