-- TSEA-X Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('student', 'instructor', 'admin', 'partner')),
  created_at timestamptz default now()
);

alter table public.users enable row level security;

-- Users can read their own data
drop policy if exists "Users can view own data" on public.users;
create policy "Users can view own data"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own data
drop policy if exists "Users can update own data" on public.users;
create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

-- ============================================
-- INSTITUTIONS TABLE
-- ============================================
create table if not exists public.institutions (
  id bigserial primary key,
  name text unique not null,
  short_name text,
  type text,
  description text,
  logo_url text,
  banner_url text,
  country text,
  website_url text,
  is_featured boolean default false,
  created_at timestamptz default now()
);

alter table public.institutions enable row level security;

-- Anyone can read institutions
drop policy if exists "Institutions are viewable by everyone" on public.institutions;
create policy "Institutions are viewable by everyone"
  on public.institutions for select
  to authenticated
  using (true);

-- ============================================
-- COURSES TABLE
-- ============================================
create table if not exists public.courses (
  id bigserial primary key,
  title text not null,
  instructor text not null,
  org text not null,
  institution_id bigint references public.institutions(id),
  rating numeric default 0.0,
  students_count text default '0',
  image text,
  tag text,
  level text,
  category text default 'Technology',
  description text,
  duration text,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;

-- Anyone can read courses
drop policy if exists "Courses are viewable by everyone" on public.courses;
create policy "Courses are viewable by everyone"
  on public.courses for select
  to authenticated
  using (true);

-- Only instructors can create courses
drop policy if exists "Instructors can create courses" on public.courses;
create policy "Instructors can create courses"
  on public.courses for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'instructor'
    )
  );

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
create table if not exists public.enrollments (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  course_id bigint references public.courses(id) on delete cascade not null,
  status text default 'active',
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

alter table public.enrollments enable row level security;

-- Users can see their own enrollments
drop policy if exists "Users can view own enrollments" on public.enrollments;
create policy "Users can view own enrollments"
  on public.enrollments for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can enroll themselves
drop policy if exists "Users can create own enrollments" on public.enrollments;
create policy "Users can create own enrollments"
  on public.enrollments for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================
-- PROJECTS TABLE (CDIO)
-- ============================================
create table if not exists public.projects (
  id bigserial primary key,
  course_id bigint references public.courses(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  current_phase text default 'conceive',
  overall_status text default 'not_started',
  completion_percentage int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

-- Users can see their own projects
drop policy if exists "Users can view own projects" on public.projects;
create policy "Users can view own projects"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can create their own projects
drop policy if exists "Users can create own projects" on public.projects;
create policy "Users can create own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own projects
drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- PROJECT CHARTERS TABLE
-- ============================================
create table if not exists public.project_charters (
  id bigserial primary key,
  project_id bigint references public.projects(id) on delete cascade not null unique,
  problem_statement text,
  success_metrics text,
  target_outcome text,
  constraints text,
  stakeholders text,
  suggested_tools jsonb,
  reasoning text,
  difficulty_level text,
  estimated_duration text,
  created_at timestamptz default now()
);

alter table public.project_charters enable row level security;

-- Users can see charters for their own projects
drop policy if exists "Users can view own project charters" on public.project_charters;
create policy "Users can view own project charters"
  on public.project_charters for select
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_id
      and projects.user_id = auth.uid()
    )
  );

-- Users can create charters for their own projects
drop policy if exists "Users can create own project charters" on public.project_charters;
create policy "Users can create own project charters"
  on public.project_charters for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_id
      and projects.user_id = auth.uid()
    )
  );

-- ============================================
-- DESIGN BLUEPRINTS TABLE
-- ============================================
create table if not exists public.design_blueprints (
  id bigserial primary key,
  project_id bigint references public.projects(id) on delete cascade not null unique,
  architecture_diagram jsonb,
  logic_flow text,
  component_list jsonb,
  created_at timestamptz default now()
);

alter table public.design_blueprints enable row level security;

drop policy if exists "Users can view own blueprints" on public.design_blueprints;
create policy "Users can view own blueprints"
  on public.design_blueprints for select
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_id
      and projects.user_id = auth.uid()
    )
  );

-- ============================================
-- IMPLEMENTATIONS TABLE
-- ============================================
create table if not exists public.implementations (
  id bigserial primary key,
  project_id bigint references public.projects(id) on delete cascade not null unique,
  code_repository_url text,
  code_snapshot text,
  notes text,
  security_check_passed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.implementations enable row level security;

drop policy if exists "Users can view own implementations" on public.implementations;
create policy "Users can view own implementations"
  on public.implementations for select
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_id
      and projects.user_id = auth.uid()
    )
  );

-- ============================================
-- DEPLOYMENTS TABLE
-- ============================================
create table if not exists public.deployments (
  id bigserial primary key,
  project_id bigint references public.projects(id) on delete cascade not null unique,
  deployment_url text,
  deployment_platform text,
  readme text,
  verification_status text default 'submitted',
  sbt_minted boolean default false,
  sbt_token_id text,
  transaction_hash text,
  explorer_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.deployments enable row level security;

drop policy if exists "Users can view own deployments" on public.deployments;
create policy "Users can view own deployments"
  on public.deployments for select
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_id
      and projects.user_id = auth.uid()
    )
  );

-- ============================================
-- CREDENTIALS TABLE
-- ============================================
create table if not exists public.credentials (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  course_id bigint references public.courses(id) on delete set null,
  title text not null,
  description text,
  issuer_name text not null,
  credential_type text,
  status text default 'issued',
  issued_at timestamptz default now()
);

alter table public.credentials enable row level security;

drop policy if exists "Users can view own credentials" on public.credentials;
create policy "Users can view own credentials"
  on public.credentials for select
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for projects table
drop trigger if exists update_projects_updated_at on public.projects;
create trigger update_projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at_column();

-- ============================================
-- INDEXES for performance
-- ============================================
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_courses_instructor on public.courses(instructor);
create index if not exists idx_courses_category on public.courses(category);
create index if not exists idx_enrollments_user_id on public.enrollments(user_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_course_id on public.projects(course_id);
create index if not exists idx_credentials_user_id on public.credentials(user_id);

-- ============================================
-- REVENUE TRANSACTIONS TABLE
-- ============================================
create table if not exists public.revenue_transactions (
  id bigserial primary key,
  course_id bigint references public.courses(id),
  user_id uuid references public.users(id),
  amount numeric not null,
  transaction_type text check (transaction_type in ('enrollment', 'certificate', 'subscription')),
  transaction_date timestamptz default now()
);

alter table public.revenue_transactions enable row level security;

-- Institution admins can view revenue for their institution's courses
drop policy if exists "Institution admins can view revenue" on public.revenue_transactions;
create policy "Institution admins can view revenue"
  on public.revenue_transactions for select
  to authenticated
  using (
    exists (
      select 1 from public.courses
      join public.institutions on institutions.id = courses.institution_id
      where courses.id = revenue_transactions.course_id
      -- For MVP, allow if user is admin or partner
      and exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role in ('admin', 'partner')
      )
    )
  );

-- Index for performance
create index if not exists idx_revenue_course_id on public.revenue_transactions(course_id);
create index if not exists idx_revenue_date on public.revenue_transactions(transaction_date);

-- ============================================
-- PKC (Personal Knowledge Container) TABLES
-- ============================================

create table if not exists public.knowledge_nodes (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  content text,
  node_type text default 'concept', -- concept, note, resource, project_artifact
  source_id text, -- reference to external source or internal artifact (e.g., project_id)
  embedding vector(1536), -- for semantic search
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.knowledge_nodes enable row level security;

drop policy if exists "Users can view own knowledge nodes" on public.knowledge_nodes;
create policy "Users can view own knowledge nodes"
  on public.knowledge_nodes for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own knowledge nodes" on public.knowledge_nodes;
create policy "Users can manage own knowledge nodes"
  on public.knowledge_nodes for all
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.knowledge_links (
  id bigserial primary key,
  source_node_id bigint references public.knowledge_nodes(id) on delete cascade not null,
  target_node_id bigint references public.knowledge_nodes(id) on delete cascade not null,
  link_type text default 'related', -- related, prerequisite, part_of
  weight float default 1.0,
  created_at timestamptz default now()
);

alter table public.knowledge_links enable row level security;

drop policy if exists "Users can view own knowledge links" on public.knowledge_links;
create policy "Users can view own knowledge links"
  on public.knowledge_links for select
  to authenticated
  using (
    exists (
      select 1 from public.knowledge_nodes
      where id = source_node_id
      and user_id = auth.uid()
    )
  );

drop policy if exists "Users can manage own knowledge links" on public.knowledge_links;
create policy "Users can manage own knowledge links"
  on public.knowledge_links for all
  to authenticated
  using (
    exists (
      select 1 from public.knowledge_nodes
      where id = source_node_id
      and user_id = auth.uid()
    )
  );

create table if not exists public.learning_journal (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  entry_type text not null, -- reflection, goal, achievement
  content text not null,
  sentiment_score float,
  tags text[],
  created_at timestamptz default now()
);

alter table public.learning_journal enable row level security;

drop policy if exists "Users can manage own learning journal" on public.learning_journal;
create policy "Users can manage own learning journal"
  on public.learning_journal for all
  to authenticated
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_knowledge_nodes_user on public.knowledge_nodes(user_id);
create index if not exists idx_learning_journal_user on public.learning_journal(user_id);
