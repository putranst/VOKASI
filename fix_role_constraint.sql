-- Quick Fix: Update Users Role Constraint
-- Run this FIRST before anything else

-- Step 1: Drop the existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add new constraint with all roles
ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('student', 'instructor', 'professor', 'admin', 'partner', 'institution_admin'));

-- Verify it worked
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
AND conname = 'users_role_check';
