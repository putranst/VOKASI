-- TSEA-X Seed Data for Supabase (Fixed Version)
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: INSERT INSTITUTIONS
-- ============================================
INSERT INTO public.institutions (name, short_name, type, description, country, is_featured) VALUES
('Massachusetts Institute of Technology', 'MIT', 'university', 'Leading research university', 'USA', true),
('United in Diversity Foundation', 'UID', 'nonprofit', 'Social impact organization', 'Indonesia', true),
('TechFuture Corporation', 'TechFuture', 'corporate', 'Technology company', 'Singapore', false),
('Ministry of Education', 'MOE', 'government', 'Government education department', 'Indonesia', false);

-- ============================================
-- STEP 2: INSERT COURSES
-- Using subqueries to get correct institution IDs
-- ============================================

-- Mats Hanson's Courses (UID institution)
INSERT INTO public.courses (title, instructor, org, institution_id, rating, students_count, image, level, category, description) 
VALUES
('Advanced Renewable Energy Systems', 
 'Mats Hanson', 
 'UID', 
 (SELECT id FROM public.institutions WHERE short_name = 'UID'), 
 4.5, 
 '25', 
 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80', 
 'Advanced', 
 'Engineering', 
 'Comprehensive course on renewable energy technologies and grid optimization'),
 
('Sustainable Urban Planning', 
 'Mats Hanson', 
 'UID', 
 (SELECT id FROM public.institutions WHERE short_name = 'UID'), 
 4.7, 
 '42', 
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&q=80', 
 'Intermediate', 
 'Urban Planning', 
 'Learn sustainable city development and green infrastructure');

-- Other Courses
INSERT INTO public.courses (title, instructor, org, institution_id, rating, students_count, image, level, category, description) 
VALUES
('Circular Economy for SMEs', 
 'Dr. Siti Rahman', 
 'UID', 
 (SELECT id FROM public.institutions WHERE short_name = 'UID'), 
 4.8, 
 '156', 
 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', 
 'Beginner', 
 'Technology', 
 'Introduction to circular economy principles for small businesses'),
 
('Digital Transformation Strategies', 
 'James Wong', 
 'TechFuture', 
 (SELECT id FROM public.institutions WHERE short_name = 'TechFuture'), 
 4.6, 
 '89', 
 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80', 
 'Intermediate', 
 'Technology', 
 'Navigate digital transformation in your organization');

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 
    (SELECT COUNT(*) FROM public.institutions) as institutions,
    (SELECT COUNT(*) FROM public.courses) as courses;

-- Show Mats Hanson's courses
SELECT id, title, instructor, students_count, institution_id
FROM public.courses 
WHERE instructor = 'Mats Hanson';
