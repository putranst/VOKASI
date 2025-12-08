-- Dual Instructor System Implementation
-- Part 1: Schema Updates

-- ============================================
-- STEP 1: Update users role constraint FIRST
-- ============================================

-- Drop old constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with professor and institution_admin roles
ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('student', 'instructor', 'professor', 'admin', 'partner', 'institution_admin'));

-- ============================================
-- STEP 2: Add new columns to users table
-- ============================================

-- Add instructor type
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS instructor_type text 
CHECK (instructor_type IN ('independent', 'institutional'));

-- Add institution affiliation for professors
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS affiliated_institution_id bigint REFERENCES public.institutions(id);

-- Add employment details
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS employment_status text 
CHECK (employment_status IN ('full_time', 'part_time', 'adjunct', 'contract'));

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS employment_start_date date;

-- ============================================
-- STEP 2: Create institution_staff table
-- ============================================

CREATE TABLE IF NOT EXISTS public.institution_staff (
  id bigserial primary key,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id bigint REFERENCES public.institutions(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'coordinator', 'viewer')),
  permissions jsonb DEFAULT '{}',
  hired_at timestamptz DEFAULT now(),
  UNIQUE(user_id, institution_id)
);

ALTER TABLE public.institution_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins can manage their staff"
ON public.institution_staff FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.institution_staff is2
    WHERE is2.institution_id = institution_staff.institution_id
    AND is2.user_id = auth.uid()
    AND is2.role = 'admin'
  )
);

-- ============================================
-- STEP 3: Update courses table
-- ============================================

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS instructor_type text 
CHECK (instructor_type IN ('independent', 'institutional'));

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.users(id);

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS status text DEFAULT 'published' 
CHECK (status IN ('draft', 'pending_approval', 'published', 'archived'));

-- ============================================
-- STEP 4: Create professor_performance table
-- ============================================

CREATE TABLE IF NOT EXISTS public.professor_performance (
  id bigserial primary key,
  professor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id bigint REFERENCES public.institutions(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_courses integer DEFAULT 0,
  total_students integer DEFAULT 0,
  average_course_rating numeric(3,2),
  total_reviews_completed integer DEFAULT 0,
  average_response_time_hours numeric(5,2),
  notes text,
  reviewed_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(professor_id, period_start, period_end)
);

ALTER TABLE public.professor_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution staff can view professor performance"
ON public.professor_performance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institution_staff
    WHERE institution_staff.institution_id = professor_performance.institution_id
    AND institution_staff.user_id = auth.uid()
  )
);

-- ============================================
-- STEP 5: Create review_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS public.review_logs (
  id bigserial primary key,
  professor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
  phase text NOT NULL,
  review_type text CHECK (review_type IN ('charter', 'design', 'implementation', 'deployment')),
  decision text CHECK (decision IN ('approved', 'rejected', 'needs_revision')),
  feedback text,
  time_spent_minutes integer,
  reviewed_at timestamptz DEFAULT now()
);

ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors can view their own review logs"
ON public.review_logs FOR SELECT
USING (auth.uid() = professor_id);

CREATE POLICY "Institution staff can view professor review logs"
ON public.review_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.institution_staff ist ON ist.user_id = auth.uid()
    WHERE u.id = review_logs.professor_id
    AND u.affiliated_institution_id = ist.institution_id
  )
);

-- ============================================
-- STEP 6: Update RLS policies for new roles
-- ============================================

-- Allow professors to create institutional courses (pending approval)
CREATE POLICY "Professors can create institutional courses"
ON public.courses FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users 
    WHERE role = 'professor' 
    AND affiliated_institution_id IS NOT NULL
  )
);

-- Allow independent instructors to create courses (instant publish)
CREATE POLICY "Instructors can create independent courses"
ON public.courses FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users 
    WHERE role = 'instructor'
    AND (instructor_type = 'independent' OR instructor_type IS NULL)
  )
);

-- Institution staff can view/manage institutional courses
CREATE POLICY "Institution staff can manage their courses"
ON public.courses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.institution_staff
    WHERE institution_staff.user_id = auth.uid()
    AND institution_staff.institution_id = courses.institution_id
  )
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('instructor_type', 'affiliated_institution_id', 'employment_status');

-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('institution_staff', 'professor_performance', 'review_logs');
