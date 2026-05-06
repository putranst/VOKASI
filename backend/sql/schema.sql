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
-- SANDOX SESSIONS
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
      ON CONFLICT DO NOTHING;
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
  ('Growth Mindset', '◇', 'Improved any competency by 20+ points in one month', 'Any competency_delta > 20 points', 'meta', NULL);

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
-- ROW LEVEL SECURITY (RLS) — for multi-tenancy
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_requests ENABLE ROW LEVEL SECURITY;

-- Institution-level data isolation
CREATE POLICY institution_isolation_users ON users
  USING (institution_id = current_setting('app.current_institution_id', true)::uuid
         OR current_setting('app.current_institution_id', true) IS NULL
         OR role IN ('admin', 'instructor'));

CREATE POLICY institution_isolation_enrollments ON enrollments
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = enrollments.user_id
        AND (u.institution_id = current_setting('app.current_institution_id', true)::uuid
             OR current_setting('app.current_institution_id', true) IS NULL)
    )
  );

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
