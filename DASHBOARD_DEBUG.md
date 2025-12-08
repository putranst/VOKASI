# Student Dashboard Troubleshooting Guide

## Issue: Dashboard stuck on "Loading..."

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for RED error messages

### Common Errors & Solutions:

#### Error: "PolicyError" or "RLS restricted"
**Fix**: Run the RLS policies

```bash
# In Supabase SQL Editor, run:
c:\Users\PT\Desktop\TSEA-X\student_dashboard_rls.sql
```

#### Error: "Invalid API key" or "supabase is not defined"
**Fix**: Check `.env.local` file

```bash
# File: c:\Users\PT\Desktop\TSEA-X\frontend\.env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

After fixing, **restart the dev server**:
```powershell
# Stop: Ctrl+C in the terminal
# Start: npm run dev
```

#### Error: "Cannot read property 'id' of undefined"
**Fix**: User not logged in properly

1. Go to http://localhost:3000/login
2. Login as one of the students:
   - frank@example.com / password123
   - grace@student.com / password123  
   - harry@learner.com / password123

###  Step 2: Check Network Tab

1. Open DevTools > Network tab  
2. Refresh the page
3. Look for failed requests (red text)
4. Click on failed request to see response

### Step 3: Check Supabase

1. Go to Supabase Dashboard
2. Table Editor → Check if `enrollments` table has data for the user
3. SQL Editor → Run:

```sql
-- Check if Frank has enrollments
SELECT * FROM enrollments 
WHERE user_id = (SELECT id FROM users WHERE email = 'frank@example.com');

-- Check if courses exist
SELECT id, title, status FROM courses LIMIT 5;
```

### Quick Test Query

Run this in Supabase SQL Editor to verify data:

```sql
SELECT 
  e.*,
  c.title as course_title,
  u.email as user_email
FROM enrollments e
JOIN courses c ON c.id = e.course_id
JOIN users u ON u.id = e.user_id
WHERE u.email = 'frank@example.com';
```

Should return at least 1-2 rows.

### Step 4: Temporary Debug Mode

If still stuck, let me know the EXACT error message from the console and I'll fix it!
