# Institution & Partner System - Implementation Plan

## Overview
Create a comprehensive institution/partner system similar to EdX's Schools & Partners page, with:
1. Public-facing institution profiles
2. Institution-specific dashboards for admins
3. Course listings by institution
4. Partner directory page

## Phase 1: Backend (IN PROGRESS)

### Models ✅
- [x] Institution model with full profile data
- [x] InstitutionType enum (University, Corporate, Nonprofit, Government)
- [x] InstitutionDetail (extended with courses/programs)
- [x] InstitutionStats (dashboard metrics)

### Sample Data (NEXT)
Create 8-10 sample institutions:
1. **MIT** (University) - Technology & Engineering
2. **Harvard** (University) - Business & Policy
3. **Tsinghua University** (University) - Architecture & Urban Planning
4. **Microsoft** (Corporate) - Cloud & AI
5. **United in Diversity** (Nonprofit) - Sustainability
6. **GovTech Institute** (Government) - Public Policy
7. **Stanford** (University) - Innovation & Entrepreneurship
8. **Google** (Corporate) - Data Science & ML

### API Endpoints (NEXT)
```python
GET /api/v1/institutions - List all institutions (with filters)
GET /api/v1/institutions/{id} - Get institution detail with courses
GET /api/v1/institutions/{id}/stats - Get dashboard stats (admin only)
GET /api/v1/institutions/{id}/courses - Get institution courses
POST /api/v1/institutions - Create institution (admin only)
PUT /api/v1/institutions/{id} - Update institution (admin only)
```

## Phase 2: Frontend

### Pages to Create
1. **`/partners`** - Partner directory (grid/list view)
   - Filter by type, country
   - Search functionality
   - Featured partners section
   - Stats: Total partners, courses, learners

2. **`/partners/[id]`** - Institution profile page
   - Hero banner with logo
   - About section
   - Course catalog (filterable)
   - Programs/Pathways
   - Featured instructors
   - Stats dashboard
   - Contact/Social links

3. **`/institution-dashboard`** - Institution admin dashboard
   - Overview stats (students, completions, revenue)
   - Course management
   - Student analytics
   - Revenue tracking
   - Instructor management

### Components to Build
- InstitutionCard (for grid display)
- InstitutionHero (profile banner)
- InstitutionStats (metrics display)
- CourseGrid (institution-specific courses)

## Phase 3: Features

### Public Features
- Browse all partner institutions
- View institution profiles
- Filter/search institutions
- See institution courses
- View partnership timeline

### Institution Admin Features
- Dashboard with analytics
- Course creation/management
- Student enrollment tracking
- Revenue reports
- Instructor management
- Profile editing

## Design Inspiration (from EdX)
- Clean grid layout for partner directory
- Large hero banners for institution profiles
- Prominent stats (courses, learners, programs)
- Filter sidebar for browsing
- Featured partners section
- Partnership badges/certifications

## Data Structure

### Institution Profile Sections
1. **Header**: Logo, Name, Type, Country
2. **Stats**: Courses, Learners, Programs, Partner Since
3. **About**: Description, Founded, Website
4. **Courses**: Filterable course catalog
5. **Programs**: Pathways/Certificates
6. **Instructors**: Featured faculty
7. **Contact**: Email, Social media

### Dashboard Metrics
- Total Active Students
- Course Completions
- Certificates Issued
- Average Rating
- Revenue (if applicable)
- Month-over-Month Growth

## Implementation Order
1. ✅ Create models
2. ⏳ Add sample data (8-10 institutions)
3. ⏳ Create API endpoints
4. ⏳ Build /partners page (directory)
5. ⏳ Build /partners/[id] page (profile)
6. ⏳ Build /institution-dashboard page
7. ⏳ Add navigation links
8. ⏳ Test and polish

## Files to Create/Modify

### Backend
- ✅ `backend/models.py` - Institution models
- ⏳ `backend/main.py` - Sample data + endpoints

### Frontend
- ⏳ `frontend/src/app/partners/page.tsx` - Directory
- ⏳ `frontend/src/app/partners/[id]/page.tsx` - Profile
- ⏳ `frontend/src/app/institution-dashboard/page.tsx` - Admin dashboard
- ⏳ `frontend/src/components/InstitutionCard.tsx`
- ⏳ `frontend/src/components/InstitutionHero.tsx`

---

**Current Status**: Models complete, starting sample data creation
**Next Step**: Add 8-10 sample institutions to init_sample_data()
