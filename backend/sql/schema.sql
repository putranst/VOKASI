-- ============================================================
-- VOKASI2 Database Schema
-- PostgreSQL 15+ with pgvector extension
-- Run: psql -U postgres -d vokasi -f schema.sql
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'instructor', 'mentor', 'admin', 'institution_admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE institution_plan AS ENUM ('free', 'student_pro', 'institution', 'enterprise');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE institution_status AS ENUM ('trial', 'active', 'suspended', 'churned');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE challenge_type AS ENUM ('open_ended', 'adversarial', 'comparison', 'case_study', 'project', 'coding', 'simulation');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE challenge_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'evaluating', 'evaluated', 'revision_requested');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mentor_request_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE badge_category AS ENUM ('domain', 'meta');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE webhook_event AS ENUM (
    'submission.created', 'submission.evaluated', 'submission.revision_requested',
    'enrollment.created', 'enrollment.completed',
    'certificate.minted', 'badge.awarded',
    'mentor_request.created', 'mentor_request.accepted',
    'course.published', 'user.created'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE simulation_type AS ENUM ('client_brief', 'crisis_scenario', 'ethics_board', 'team_simulation');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE simulation_status AS ENUM ('active', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE circle_status AS ENUM ('forming', 'active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE circle_role AS ENUM ('explainer', 'questioner', 'observer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- INSTITUTIONS
-- ============================================================
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan institution_plan NOT NULL DEFAULT 'free',
  status institution_status NOT NULL DEFAULT 'trial',
  domain TEXT,  -- e.g. 'upi.edu' for SSO
  settings JSONB DEFAULT '{}',
  max_students INTEGER,
  max_instructors INTEGER,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE institution_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT 'null',
  UNIQUE(institution_id, key)
);

CREATE INDEX idx_institutions_slug ON institutions(slug);
CREATE INDEX idx_institutions_status ON institutions(status);
CREATE INDEX idx_institutions_plan ON institutions(plan);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  anonymous_handle TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  avatar_url TEXT,
  bio TEXT,
  locale TEXT DEFAULT 'id_ID',  -- Bahasa Indonesia default
  competency_vector vector(12) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0',  -- 12-dim brain-based competency space
  -- 12 dims: Prompt Engineering, Model Evaluation, Data Analysis, AI Automation,
  --          Critical Thinking, ML Fundamentals, AI Ethics, Socratic Reasoning,
  --          Peer Collaboration, Reflection Depth, Sandbox Experimentation, Communication
  reasoning_depth_score DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_reflection_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_agent TEXT,
  ip_address INET,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_competency ON users USING ivfflat (competency_vector vector_cosine_ops);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id),
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  structure JSONB DEFAULT '[]',  -- ordered list of challenge_ids + metadata
  settings JSONB DEFAULT '{}',  -- {enrollment_open, max_students, deadline, etc.}
  status course_status NOT NULL DEFAULT 'draft',
  track TEXT,  -- e.g. 'smk_fast_track', 'polytechnic_deep_dive', 'university_ai_fluency', 'blkk_reskilling'
  difficulty challenge_difficulty DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  enrollment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_track ON courses(track);

-- ============================================================
-- CHALLENGES
-- ============================================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rubric JSONB NOT NULL DEFAULT '{}',
  -- rubric: { criteria: [{name, weight, levels: {low, medium, high}}], total_points }
  domain_tags TEXT[] DEFAULT '{}',
  difficulty challenge_difficulty NOT NULL DEFAULT 'medium',
  type challenge_type NOT NULL DEFAULT 'open_ended',
  hints JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  starter_code TEXT,
  ai_system_prompt TEXT,
  max_submissions INTEGER DEFAULT 5,
  time_limit_minutes INTEGER,
  settings JSONB DEFAULT '{}',
  avg_score DECIMAL(5,2),
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_challenges_domain ON challenges USING gin(domain_tags);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_type ON challenges(type);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  content JSONB NOT NULL DEFAULT '{}',
  -- content: { text, files: [{name, url, size}], sandbox_url, code }
  reflection TEXT,
  ai_feedback JSONB,  -- {scores: {}, narrative, suggestions, competency_delta}
  competency_delta JSONB,  -- {vector_update: [...], delta_per_axis: [...]}
  reasoning_depth_score DECIMAL(5,2),
  status submission_status NOT NULL DEFAULT 'submitted',
  version_number INTEGER NOT NULL DEFAULT 1,
  evaluator_model TEXT,  -- 'kimi-k2.6' or 'claude-3.5-sonnet'
  is_certification BOOLEAN DEFAULT false,
  proctored BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX idx_submissions_course ON submissions(course_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_user_challenge ON submissions(user_id, challenge_id);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  status TEXT NOT NULL DEFAULT 'active',  -- active, completed, dropped
  progress DECIMAL(5,2) DEFAULT 0,  -- percentage 0-100
  completed_challenges UUID[] DEFAULT '{}',
  current_challenge_id UUID REFERENCES challenges(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ============================================================
-- CERTIFICATES (Blockchain-verified credentials)
-- ============================================================
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  issuance_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  certificate_hash TEXT UNIQUE NOT NULL,  -- SHA-256 for blockchain verification
  credential_id TEXT UNIQUE,  -- External blockchain ID
  credential_url TEXT,  -- Link to verify
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_hash ON certificates(certificate_hash);

-- ============================================================
-- PORTFOLIOS
-- ============================================================
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  artifacts JSONB DEFAULT '[]',
  -- [{id, challenge_id, title, description, url, type, created_at, tags: []}]
  competency_heatmap JSONB DEFAULT '{}',
  -- {prompt_engineering: 0.8, model_evaluation: 0.6, ...}
  failure_resume JSONB DEFAULT '{"entries": []}',
  -- [{challenge_id, what_failed, lessons_learned, what_id_do_differently, created_at}]
  expert_endorsements JSONB DEFAULT '[]',
  -- [{expert_name, credential, endorsement_text, date}]
  reflection_history JSONB DEFAULT '[]',
  -- [{date, summary, depth_score}]
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MENTOR REQUESTS
-- ============================================================
CREATE TABLE mentor_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id),
  mentor_id UUID NOT NULL REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  message TEXT,
  goals JSONB DEFAULT '[]',
  status mentor_request_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentor_requests_student ON mentor_requests(student_id);
CREATE INDEX idx_mentor_requests_mentor ON mentor_requests(mentor_id);
CREATE INDEX idx_mentor_requests_status ON mentor_requests(status);

-- ============================================================
-- BADGES
-- ============================================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria TEXT NOT NULL,
  category badge_category NOT NULL,
  domain TEXT,  -- for domain badges: which domain
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by UUID REFERENCES users(id),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_badges_category ON badges(category);

-- ============================================================
-- REFLECTIONS (Weekly Journal)
-- ============================================================
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  content TEXT NOT NULL,
  growth_evidence JSONB DEFAULT '[]',
  depth_score DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_number, year)
);

CREATE INDEX idx_reflections_user ON reflections(user_id);
CREATE INDEX idx_reflections_week ON reflections(year, week_number);

-- ============================================================
-- PEER REVIEWS
-- ============================================================
CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  scores JSONB NOT NULL DEFAULT '{}',
  -- {relevance: 1-5, reasoning_depth: 1-5, clarity: 1-5, originality: 1-5}
  narrative TEXT,
  helpful_rating INTEGER CHECK (helpful_rating BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'completed',  -- assigned, completed, dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(submission_id, reviewer_id)
);

CREATE TABLE peer_review_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, expired
  UNIQUE(submission_id, reviewer_id)
);

CREATE INDEX idx_peer_reviews_submission ON peer_reviews(submission_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);

-- ============================================================
-- SANDBOX TEMPLATES
-- ============================================================
DO $$ BEGIN
  CREATE TABLE sandbox_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    language TEXT NOT NULL,
    category TEXT DEFAULT 'exercise',
    difficulty TEXT DEFAULT 'beginner',
    instructions TEXT,
    starter_files JSONB DEFAULT '[]'::jsonb,
    test_cases JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    usage_count INT DEFAULT 0,
    estimated_minutes INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX idx_sandbox_templates_language ON sandbox_templates(language);
CREATE INDEX idx_sandbox_templates_category ON sandbox_templates(category);
CREATE INDEX idx_sandbox_templates_difficulty ON sandbox_templates(difficulty);

-- ============================================================
-- SANDBOX SESSIONS
-- ============================================================
CREATE TABLE sandbox_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  container_id TEXT,
  state_url TEXT,
  version_history JSONB DEFAULT '[]',
  mistake_log JSONB DEFAULT '[]',
  -- [{version, mistake_type, code_snippet, corrected_at}]
  status TEXT NOT NULL DEFAULT 'starting',  -- starting, running, terminated, error
  resource_usage JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  terminated_at TIMESTAMPTZ
);

CREATE INDEX idx_sandbox_sessions_user ON sandbox_sessions(user_id);
CREATE INDEX idx_sandbox_sessions_status ON sandbox_sessions(status);

-- ============================================================
-- WORKPLACE SIMULATION ENGINE (PRD v2.3 §4.5)
-- AI-generated client/stakeholder personas with realistic, messy requirements
-- Dynamic difficulty adapts to student competency level
-- ============================================================

CREATE TABLE simulation_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  simulation_type simulation_type NOT NULL,
  name TEXT NOT NULL,          -- e.g. "Pak Hendra Wijaya"
  role TEXT NOT NULL,          -- e.g. "CTO"
  company TEXT NOT NULL,        -- e.g. "PT Fintech Sejahtera"
  background TEXT NOT NULL,     -- persona backstory for AI grounding
  communication_style TEXT NOT NULL, -- e.g. "Terburu-buru, suka interromuk"
  constraints_json JSONB DEFAULT '{}',
  -- {budget: "terbatas", timeline: "semalam", technical_depth: "minimal"}
  domain_tags TEXT[] DEFAULT '{}',
  difficulty_level INTEGER DEFAULT 1, -- 1=easy, 2=medium, 3=hard
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE simulation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  simulation_type simulation_type NOT NULL,
  persona_id UUID NOT NULL REFERENCES simulation_personas(id),
  title TEXT NOT NULL,
  scenario_context JSONB NOT NULL DEFAULT '{}',
  -- {industry, location, company_size, problem_statement, constraints}
  turns JSONB DEFAULT '[]',      -- [{turn_num, persona_message, student_response, evaluation}]
  current_turn INTEGER DEFAULT 0,
  max_turns INTEGER DEFAULT 8,
  difficulty_level INTEGER DEFAULT 1,
  competency_delta JSONB DEFAULT '{}',
  status simulation_status NOT NULL DEFAULT 'active',
  final_evaluation JSONB,        -- {overall_score, strengths, improvements, badge_awarded}
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sim_sessions_user ON simulation_sessions(user_id);
CREATE INDEX idx_sim_sessions_type ON simulation_sessions(simulation_type);
CREATE INDEX idx_sim_sessions_status ON simulation_sessions(status);

CREATE TABLE simulation_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  student_response TEXT NOT NULL,
  ai_evaluation JSONB NOT NULL DEFAULT '{}',
  -- {clarity_score, reasoning_depth, empathy_score, next_persona_action, competency_impact}
  persona_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sim_evals_session ON simulation_evaluations(session_id);

-- ============================================================
-- PEER SOCRATIC CIRCLES (PRD v2.3 §4.8)
-- Auto-match 3-4 students by complementary skill gaps
-- 5-min explanation rounds with AI evaluation
-- Anonymous by default, optional reveal
-- ============================================================

CREATE TABLE socratic_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status circle_status NOT NULL DEFAULT 'forming',
  topic TEXT NOT NULL,              -- concept/topic for this circle
  topic_domain TEXT[],              -- domain tags for matching
  max_participants INTEGER DEFAULT 4,
  scheduled_at TIMESTAMPTZ,        -- when the circle session is scheduled
  completed_at TIMESTAMPTZ,
  ai_evaluation JSONB DEFAULT '{}', -- aggregated AI evaluation scores
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(week_number, year, topic)
);

CREATE TABLE circle_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES socratic_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role circle_role NOT NULL DEFAULT 'explainer',  -- assigned role in session
  preparation_topic TEXT,        -- what this student will explain
  preparation_notes TEXT,        -- student's prepared explanation
  turn_order INTEGER,           -- order in which they present
  attendance_status TEXT DEFAULT 'pending', -- pending, present, absent
  ai_explanation_score DECIMAL(5,2),  -- AI score for explanation clarity
  ai_questioning_score DECIMAL(5,2),    -- AI score for peer questioning quality
  is_anonymous BOOLEAN DEFAULT true,    -- anonymous by default
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

CREATE TABLE circle_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES socratic_circles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES circle_participants(id) ON DELETE CASCADE,
  round_type circle_role NOT NULL, -- explainer, questioner, observer
  explanation_text TEXT,            -- what explainer said
  questions_json JSONB DEFAULT '[]', -- [{asker_id, question, quality_score}]
  ai_feedback JSONB DEFAULT '{}',  -- {clarity, depth, engagement} scores
  duration_seconds INTEGER,        -- how long this turn took
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_circles_status ON socratic_circles(status);
CREATE INDEX idx_circles_schedule ON socratic_circles(year, week_number);
CREATE INDEX idx_circle_participants_circle ON circle_participants(circle_id);
CREATE INDEX idx_circle_participants_user ON circle_participants(user_id);
CREATE INDEX idx_circle_rounds_circle ON circle_rounds(circle_id);

-- ============================================================
-- FAILURE RESUME (PRD v2.3 §4.7)
-- Document failures in portfolio — failure is a feature
-- Phoenix Rising badge: document 5 failures with lessons learned
-- ============================================================

CREATE TABLE portfolio_failure_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  failure_title TEXT NOT NULL,
  failure_description TEXT,
  lessons_learned TEXT,
  recovery_steps TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_failure_entries_user ON portfolio_failure_entries(user_id);

-- ============================================================
-- WEBHOOKS
-- ============================================================
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events webhook_event[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  headers JSONB DEFAULT '{}',
  failure_count INTEGER DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event webhook_event NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivery_time_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, success, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);


-- ============================================================
-- NOTIFICATIONS (§4.10)
-- ============================================================
DO $$ BEGIN
  CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,  -- submission_evaluated | badge_earned | mentor_request_accepted | peer_review_received | certificate_ready | streak_reminder | enrollment_confirmed | challenge_deadline | reflection_prompt | system_announcement
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    link TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  actor_type TEXT,  -- 'user', 'system', 'api'
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);


-- ============================================================
-- STREAKS (Gamification §4.7)
-- ============================================================
DO $$ BEGIN
  CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);

-- ============================================================
-- TUTOR SESSIONS (SocraticChat §4.2)
-- ============================================================
DO $$ BEGIN
  CREATE TABLE tutor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'guide',  -- guide | socratic | lecture
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user ON tutor_sessions(user_id);

-- ============================================================
-- TUTOR MESSAGES (SocraticChat §4.2)
-- ============================================================
DO $$ BEGIN
  CREATE TABLE tutor_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES tutor_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,  -- user | assistant
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_tutor_messages_session ON tutor_messages(session_id);

-- ============================================================
-- MODULES (Course structure)
-- ============================================================
DO $$ BEGIN
  CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    content JSONB DEFAULT '[]',  -- Puck editor content blocks
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

-- ============================================================
-- LESSON COMPLETIONS
-- ============================================================
DO $$ BEGIN
  CREATE TABLE lesson_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, module_id)
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_module ON lesson_completions(module_id);

-- ============================================================
-- ANALYTICS MATERIALIZED VIEW
-- ============================================================
CREATE MATERIALIZED VIEW platform_analytics AS
SELECT
  date_trunc('day', s.created_at) AS day,
  COUNT(DISTINCT s.user_id) FILTER (WHERE s.status = 'submitted') AS active_students,
  COUNT(DISTINCT s.challenge_id) AS challenges_attempted,
  COUNT(s.id) AS total_submissions,
  ROUND(AVG(s.reasoning_depth_score) FILTER (WHERE s.status = 'evaluated'), 2) AS avg_reasoning_score,
  COUNT(DISTINCT e.user_id) AS new_enrollments,
  COUNT(DISTINCT cb.id) FILTER (WHERE c.status = 'completed') AS certifications
FROM submissions s
LEFT JOIN enrollments e ON e.user_id = s.user_id AND date_trunc('day', e.enrolled_at) = date_trunc('day', s.created_at)
LEFT JOIN certificates cb ON cb.user_id = s.user_id
LEFT JOIN courses c ON c.id = cb.course_id
GROUP BY day
ORDER BY day DESC;

CREATE UNIQUE INDEX idx_platform_analytics_day ON platform_analytics(day);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: award Brain Founder badge on first submission
-- ============================================================
CREATE OR REPLACE FUNCTION award_brain_founder_badge()
RETURNS TRIGGER AS $$
DECLARE
  badge_id UUID;
  first_sub BOOLEAN;
BEGIN
  SELECT COUNT(*) < 1 INTO first_sub FROM submissions WHERE user_id = NEW.user_id;
  IF first_sub THEN
    SELECT id INTO badge_id FROM badges WHERE name = 'Brain Founder';
    IF badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id, awarded_at)
      VALUES (NEW.user_id, badge_id, NOW())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_award_brain_founder
AFTER INSERT ON submissions
FOR EACH ROW EXECUTE FUNCTION award_brain_founder_badge();

-- ============================================================
-- TRIGGER: update challenge avg_score after evaluation
-- ============================================================
CREATE OR REPLACE FUNCTION update_challenge_avg_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'evaluated' THEN
    UPDATE challenges
    SET avg_score = (
      SELECT ROUND(AVG((ai_feedback->>'overall')::decimal), 2)
      FROM submissions
      WHERE challenge_id = NEW.challenge_id AND status = 'evaluated'
    ),
    submission_count = submission_count + 1
    WHERE id = NEW.challenge_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_challenge_stats
AFTER UPDATE OF status ON submissions
FOR EACH ROW EXECUTE FUNCTION update_challenge_avg_score();

-- ============================================================
-- SEED DATA: Badges
-- ============================================================
INSERT INTO badges (name, icon, description, criteria, category, domain) VALUES
  ('Prompt Engineer', '◈', 'Excellence in prompt design and optimization', 'Score 80+ on 5 prompt engineering challenges', 'domain', 'Prompt Engineering'),
  ('Model Evaluator', '◎', 'Benchmarking and evaluating AI model performance', 'Complete 5 model evaluation challenges with 75+ avg score', 'domain', 'Model Evaluation'),
  ('Data Analyst', '◐', 'Extract, analyze, and visualize data effectively', 'Submit 5 data analysis artifacts with 80+ scores', 'domain', 'Data Analysis'),
  ('AI Automator', '◇', 'Build and deploy AI-powered automation workflows', 'Build and submit 3 automation project artifacts', 'domain', 'AI Automation'),
  ('Critical Thinker', '◑', 'Skilled at reasoning through complex AI ethics and deployment dilemmas', 'Complete 5 ethics/critical reasoning challenges', 'domain', 'AI Ethics'),
  ('ML Fundamentals', '◆', 'Understands core machine learning concepts and model lifecycles', 'Pass ML fundamentals assessment with 80+', 'domain', 'ML Fundamentals'),
  ('Socratic Scholar', '○', 'Active learner who engages deeply through dialogue', 'Complete 20+ Socratic Chat sessions', 'domain', 'Socratic Reasoning'),
  ('Reflection Pro', '◉', 'Consistent self-reflection leads to faster growth', 'Submit 10 weekly reflection journals', 'domain', 'Reflection Depth'),
  ('Brain Founder', '🜂', 'Completed your first challenge — the hardest step', 'Submit your first challenge', 'meta', NULL),
  ('Resilience Streak', '◈', '7-day reflection streak — consistency builds mastery', '7 consecutive days with a reflection entry', 'meta', NULL),
  ('Socratic Master', '◎', '50+ Socratic Chat sessions — dialogue sharpens thinking', 'Complete 50 Socratic Chat sessions', 'meta', NULL),
  ('Peer Mentor', '◆', 'Gave back — 10+ quality peer reviews for fellow students', 'Write 10 peer reviews with helpful ratings', 'meta', NULL),
  ('Growth Mindset', '◇', 'Improved any competency by 20+ points in one month', 'Any competency_delta > 20 points', 'meta', NULL),
  ('Crisis Manager', '⚡', 'Navigated a full AI crisis scenario from failure to recovery', 'Complete 1 crisis scenario simulation', 'meta', NULL),
  ('Ethics Champion', '⚖', 'Successfully defended an AI deployment decision to a regulatory panel', 'Complete 1 ethics board simulation', 'meta', NULL),
  ('Client Whisperer', '💬', 'Turned vague client requirements into clear, actionable AI solutions', 'Complete 1 client brief simulation', 'meta', NULL),
  ('Circle Companion', '🔄', 'Regular participant in Socratic peer learning circles', 'Complete 3 Socratic Circle sessions', 'meta', NULL),
  ('Team Player', '🤝', 'Completed a full team simulation — collaboration and coordination under pressure', 'Complete 1 team simulation', 'meta', NULL),
  ('Phoenix Rising', '🔥', 'Documented 5 failures with lessons learned — rises from every setback', '5 Failure Resume entries with lessons learned', 'meta', NULL),
  ('Activity Streak', '💪', '7-day activity streak — consistency builds mastery', '7 consecutive days of activity', 'meta', NULL),
  ('Consistency Champion', '🏆', '30-day activity streak — dedication personified', '30 consecutive days of activity', 'meta', NULL);

-- ============================================================
-- SEED DATA: Sample Challenges (PRD §8.1)
-- ============================================================
INSERT INTO challenges (title, description, rubric, domain_tags, difficulty, type, ai_system_prompt) VALUES
  ('Optimize a prompt for a local e-commerce chatbot that reduces hallucination about inventory.',
   'You are consulting for a small Indonesian e-commerce startup. Their chatbot frequently hallucinates about product availability. Design and optimize a prompt that reduces these hallucinations while maintaining helpful customer service.',
   '{"criteria":[{"name":"Clarity","weight":0.2,"levels":{"low":"Vague instructions","medium":"Clear structure","high":"Ambiguity-free with edge case handling"}},{"name":"Hallucination Control","weight":0.4,"levels":{"low":"No safeguards","medium":"Basic uncertainty handling","high":"Proactive uncertainty expressions"}},{"name":"Domain Adaptation","weight":0.2,"levels":{"low":"Generic prompt","medium":"Indonesian context","high":"Local cultural + linguistic nuance"}},{"name":"Evaluation Rigor","weight":0.2,"levels":{"low":"No test cases","medium":"Basic test scenarios","high":"Comprehensive test suite"}}],"total_points":100}',
   ARRAY['Prompt Engineering','AI Ethics'], 'medium', 'open_ended',
   'You are an expert prompt engineer specializing in reducing LLM hallucinations for Indonesian e-commerce chatbots. Provide rigorous evaluation with specific scores and actionable feedback.'),

  ('Red-team a prompt: Find 3 ways to make this medical advice bot give dangerous output.',
   'You have been given access to a medical advice chatbot prompt. Your task is adversarial: find 3 distinct ways to make it produce dangerous, incorrect, or harmful medical advice. Document your findings.',
   '{"criteria":[{"name":"Adversarial Creativity","weight":0.3,"levels":{"low":"Surface-level tricks","medium":"Moderate jailbreaks","high":"Subtle, sophisticated attacks"}},{"name":"Severity Assessment","weight":0.3,"levels":{"low":"Low-harm outputs","medium":"Moderate harm potential","high":"Severe harm potential"}},{"name":"Remediation Quality","weight":0.4,"levels":{"low":"No fixes","medium":"Partial mitigations","high":"Comprehensive safeguards"}}],"total_points":100}',
   ARRAY['Prompt Engineering','AI Ethics'], 'hard', 'adversarial',
   'You are a red-team security researcher specializing in AI safety. Evaluate adversarial prompts with a security-first mindset.'),

  ('Given two sentiment analysis models, evaluate which is more robust to sarcasm in Bahasa Indonesia social media posts.',
   'Compare Model A (fine-tuned IndoBERT) and Model B (Kimi K2.6 zero-shot) on a dataset of 100 Indonesian social media posts with sarcastic sentiment. Provide a rigorous evaluation report.',
   '{"criteria":[{"name":"Accuracy","weight":0.25,"levels":{"low":"<60%","medium":"60-75%","high":">75%"}},{"name":"Sarcasm Handling","weight":0.35,"levels":{"low":"Ignores sarcasm","medium":"Detects some sarcasm","high":"Robust to Indonesian sarcasm patterns"}},{"name":"Bahasa Indonesia Fluency","weight":0.2,"levels":{"low":"English-dominant","medium":"Adequate BI","high":"Native BI understanding"}},{"name":"Report Clarity","weight":0.2,"levels":{"low":"Disorganized","medium":"Clear structure","high":"Publication-quality analysis"}}],"total_points":100}',
   ARRAY['Model Evaluation','Data Analysis'], 'medium', 'comparison',
   'You are an ML researcher specializing in Indonesian NLP and model evaluation.'),

  ('A CV-screening model rejects 80% of female applicants. Diagnose the bias and propose a fix.',
   'You are an AI ethics consultant. A company's CV-screening model systematically disadvantages female applicants (80% rejection rate vs 45% for males). Perform a comprehensive bias audit and propose mitigation strategies.',
   '{"criteria":[{"name":"Bias Diagnosis Depth","weight":0.35,"levels":{"low":"Surface analysis","medium":"Multi-factor analysis","high":"Root cause with evidence"}},{"name":"Mitigation Quality","weight":0.35,"levels":{"low":"Band-aid solutions","medium":"Systemic improvements","high":"Comprehensive bias mitigation framework"}},{"name":"Legal/Ethical Awareness","weight":0.2,"levels":{"low":"No consideration","medium":"Basic awareness","high":"Full PDPA + ISO 23971 alignment"}},{"name":"Feasibility","weight":0.1,"levels":{"low":"Theoretical only","medium":"Partially implementable","high":"Immediately actionable"}}],"total_points":100}',
   ARRAY['AI Ethics','Model Evaluation'], 'hard', 'case_study',
   'You are an AI ethics researcher specializing in algorithmic bias and Indonesian employment law.'),

  ('Build a no-code workflow that automatically categorizes customer complaints from a Google Sheet and drafts responses.',
   'Design a Make.com (or similar) no-code workflow that reads customer complaints from a Google Sheet, categorizes them using AI, and drafts personalized response templates. Document the workflow steps and tools used.',
   '{"criteria":[{"name":"Workflow Completeness","weight":0.3,"levels":{"low":"Partial steps","medium":"Most steps covered","high":"End-to-end with error handling"}},{"name":"AI Integration","weight":0.3,"levels":{"low":"No AI used","medium":"Basic AI categorization","high":"Contextual AI routing and drafting"}},{"name":"Scalability","weight":0.2,"levels":{"low":"Manual bottleneck","medium":"Semi-automated","high":"Fully automated with monitoring"}},{"name":"Indonesian Context","weight":0.2,"levels":{"low":"English-only","medium":"Basic BI support","high":"Full Bahasa Indonesia with local nuance"}}],"total_points":100}',
   ARRAY['AI Automation'], 'medium', 'project',
   'You are an automation architect specializing in no-code AI workflows for Indonesian SMEs.');

-- ============================================================
-- SEED DATA: Course Templates (PRD §8.2)
-- ============================================================
INSERT INTO courses (title, slug, description, track, difficulty, status, settings) VALUES
  ('AI Fundamentals — SMK Fast Track', 'ai-fundamentals-smk-fast-track',
   '8-week intensive AI course designed for SMK students. 3 challenges per week focused on employability skills.',
   'smk_fast_track', 'medium', 'published',
   '{"enrollment_open": true, "max_students": 50, "weekly_challenges": 3, "deadline_mode": "flexible"}'),

  ('AI Fluency — University Track', 'ai-fluency-university',
   '6-week non-credit AI fluency program. Judgment-focused, no coding required. Designed for university students.',
   'university_ai_fluency', 'easy', 'published',
   '{"enrollment_open": true, "max_students": 200, "certificate_eligible": true}');

-- ============================================================

-- Institution-level data isolation
-- ============================================================
-- FINAL: updated_at defaults
-- ============================================================
ALTER TABLE institutions ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE institutions ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE courses ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE courses ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE challenges ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE challenges ALTER COLUMN updated_at SET DEFAULT NOW();


-- =====================================================
-- SEED DATA: modules (idempotent)
-- =====================================================
DO $$ BEGIN
  INSERT INTO modules (course_id, title, description, order_index, content)
  SELECT c.id, 'Introduction to CDIO', 'Learn the fundamentals of Conceive-Design-Implement-Operate framework', 1, '[]'::jsonb
  FROM courses c WHERE c.title = 'Full-Stack Web Development with AI' LIMIT 1
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO modules (course_id, title, description, order_index, content)
  SELECT c.id, 'Setting Up Your Development Environment', 'Install and configure tools needed for modern web development', 2, '[]'::jsonb
  FROM courses c WHERE c.title = 'Full-Stack Web Development with AI' LIMIT 1
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO modules (course_id, title, description, order_index, content)
  SELECT c.id, 'AI-Powered Code Generation', 'Using AI tools to accelerate development workflow', 3, '[]'::jsonb
  FROM courses c WHERE c.title = 'Full-Stack Web Development with AI' LIMIT 1
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO modules (course_id, title, description, order_index, content)
  SELECT c.id, 'Building REST APIs with Node.js', 'Create robust APIs using Node.js and Express', 4, '[]'::jsonb
  FROM courses c WHERE c.title = 'Full-Stack Web Development with AI' LIMIT 1
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO modules (course_id, title, description, order_index, content)
  SELECT c.id, 'Database Design with PostgreSQL', 'Learn relational database design and optimization', 5, '[]'::jsonb
  FROM courses c WHERE c.title = 'Full-Stack Web Development with AI' LIMIT 1
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

-- =====================================================
-- SEED DATA: simulation_personas (idempotent)
-- =====================================================
DO $$ BEGIN
  INSERT INTO simulation_personas (simulation_type, name, role, company, background, communication_style, constraints_json)
  VALUES (
    'client_brief',
    'Pak Hendra Wijaya',
    'CTO',
    'PT Fintech Sejahtera',
    'Experienced technology leader with 15+ years in fintech. Values clean code and scalable architecture. Impatient with vague requirements.',
    'Terburu-buru, suka interupsi, menuntut detail teknis yang spesifik',
    '{"budget": "terbatas", "timeline": "ketat", "priority": "skalabilitas"}'::jsonb
  )
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO simulation_personas (simulation_type, name, role, company, background, communication_style, constraints_json)
  VALUES (
    'crisis_scenario',
    'Ibu Sari Kusuma',
    'Operations Director',
    'PT Logistics Nusantara',
    'Crisis management expert who has handled multiple operational disasters. Calm under pressure but expects immediate action and clear communication.',
    'Tenang tapi tegas, komunikasi singkat dan jelas, expect action plan dalam 5 menit',
    '{"severity": "high", "time_pressure": "extreme", "stakeholders": "media, customers, board"}'::jsonb
  )
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO simulation_personas (simulation_type, name, role, company, background, communication_style, constraints_json)
  VALUES (
    'ethics_board',
    'Dr. Budi Santoso',
    'Ethics Committee Chair',
    'Universitas Teknologi Indonesia',
    'Academic with 20+ years researching AI ethics. Very thorough, asks probing questions about every decision. Values transparency and fairness.',
    'Sangat detail, banyak tanya "mengapa", butuh penjelasan etis untuk setiap keputusan',
    '{"focus": "fairness", "concern": "bias in AI", "requirement": "documented rationale"}'::jsonb
  )
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO simulation_personas (simulation_type, name, role, company, background, communication_style, constraints_json)
  VALUES (
    'team_simulation',
    'Andi Pratama',
    'Junior Developer',
    'PT Digital Solutions',
    'Fresh graduate eager to learn but lacks experience. Often makes mistakes with version control and testing. Needs patient guidance.',
    'Antusias tapi sering bingung, banyak tanya "gimana caranya?", need step-by-step guidance',
    '{"skill_level": "junior", "needs_mentoring": true, "common_errors": ["git conflicts", "missing tests"]}'::jsonb
  )
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO simulation_personas (simulation_type, name, role, company, background, communication_style, constraints_json)
  VALUES (
    'client_brief',
    'Ms. Chen Wei Ling',
    'Product Manager',
    'Singapore E-Commerce Pte Ltd',
    'Results-driven PM with background in data analytics. Speaks a mix of English and Mandarin. Focuses on metrics and user engagement.',
    'Direct, data-driven, frequent use of "ROI", "KPI", "user metrics". Speaks with slight Singlish accent.',
    '{"language": "english_with_mandarin", "focus": "metrics", "pressure": "high_growth_expectations"}'::jsonb
  )
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

-- ============================================================================
-- DOCUMENT PROCESSING (Phase 2: MAIC-UI feature adoption)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('uploaded', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx')),
    file_size BIGINT,
    status document_status DEFAULT 'uploaded',
    processing_result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- ============================================================================
-- COURSE TEMPLATES (Phase 3: MAIC-UI template system adoption)
-- ============================================================================

DO $$ BEGIN
  CREATE TABLE course_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    grade_levels TEXT[] DEFAULT '{}',
    domain_tags TEXT[] DEFAULT '{}',
    block_structure JSONB NOT NULL,
    preview_html TEXT,
    usage_count INTEGER DEFAULT 0,
    average_rating FLOAT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TABLE template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES course_templates(id),
    course_id UUID REFERENCES courses(id),
    user_id UUID NOT NULL REFERENCES users(id),
    customization_score FLOAT,
    used_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_course_templates_category ON course_templates(category);
CREATE INDEX IF NOT EXISTS idx_course_templates_active ON course_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage(user_id);

-- ============================================================
-- LESSONS (Slide/Quiz/Sandbox/Simulation types)
-- ============================================================
DO $$ BEGIN
  CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lesson_type TEXT NOT NULL DEFAULT 'slide' CHECK (lesson_type IN ('slide', 'quiz', 'sandbox', 'simulation', 'video', 'interactive')),
    order_index INTEGER NOT NULL DEFAULT 0,
    content JSONB DEFAULT '{}',  -- Type-specific content (slides, questions, sandbox config, etc.)
    settings JSONB DEFAULT '{}',  -- {time_limit, passing_score, show_answers, etc.}
    estimated_minutes INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, order_index);

-- Lesson attempts tracking
DO $$ BEGIN
  CREATE TABLE lesson_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score FLOAT,
    time_spent_seconds INTEGER,
    answers JSONB DEFAULT '{}',  -- User's answers for quiz types
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
  );
EXCEPTION WHEN duplicate_table THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_lesson_attempts_user ON lesson_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attempts_lesson ON lesson_attempts(lesson_id);

