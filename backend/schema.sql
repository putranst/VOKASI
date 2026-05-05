-- VOKASI2 — PostgreSQL Schema (PRD v2.3 §8)
-- Requires: PostgreSQL 15+ with pgvector extension

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ─────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin', 'mentor');
CREATE TYPE challenge_domain AS ENUM (
  'prompt_engineering', 'model_evaluation', 'ai_ethics', 'data_analysis', 'automation'
);
CREATE TYPE difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'evaluated');
CREATE TYPE sandbox_template AS ENUM ('jupyter', 'playground', 'sql', 'no_code');
CREATE TYPE sandbox_status AS ENUM ('active', 'paused', 'terminated');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE institution_plan AS ENUM ('free', 'student_pro', 'institution', 'enterprise');
CREATE TYPE tutor_mode AS ENUM ('guide', 'devils_advocate', 'peer');

-- ─── Institutions ──────────────────────────────────────────────
CREATE TABLE institutions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  domain        TEXT UNIQUE,
  plan          institution_plan NOT NULL DEFAULT 'free',
  branding      JSONB DEFAULT '{}',  -- {primaryColor, logoUrl, platformName}
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Users ──────────────────────────────────────────────────────
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT,
  password_hash       TEXT NOT NULL,
  full_name           TEXT NOT NULL,
  role                user_role NOT NULL DEFAULT 'student',
  institution_id      UUID REFERENCES institutions(id) ON DELETE SET NULL,
  nisn                TEXT,  -- SMK students
  nim                 TEXT,  -- University students
  avatar_url          TEXT,
  competency_vector   VECTOR(12) DEFAULT '{"0","0","0","0","0","0","0","0","0","0","0","0"}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_institution_idx ON users(institution_id);
CREATE INDEX users_role_idx ON users(role);

-- ─── Auth Tokens ─────────────────────────────────────────────────
CREATE TABLE auth_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX auth_tokens_token_idx ON auth_tokens(token);
CREATE INDEX auth_tokens_user_idx ON auth_tokens(user_id);

-- ─── Challenges ─────────────────────────────────────────────────
CREATE TABLE challenges (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  rubric              JSONB NOT NULL DEFAULT '{}',
    -- {decomposition:{weight,description}, toolUsage:{...}, outputQuality:{...}, reflection:{...}}
  difficulty          difficulty NOT NULL DEFAULT 'beginner',
  domain_tags         challenge_domain[] NOT NULL DEFAULT '{}',
  sandbox_template    sandbox_template,
  max_attempts        INTEGER NOT NULL DEFAULT 3,
  time_limit_minutes  INTEGER,
  is_weekly           BOOLEAN NOT NULL DEFAULT FALSE,
  rotation_week       INTEGER,
  rubric_raw_content  TEXT,  -- Full problem content (for AI evaluation)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX challenges_difficulty_idx ON challenges(difficulty);
CREATE INDEX challenges_is_weekly_idx ON challenges(is_weekly) WHERE is_weekly = TRUE;

-- ─── Submissions ────────────────────────────────────────────────
CREATE TABLE submissions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id        UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  content             JSONB NOT NULL DEFAULT '{}',
    -- {code?, memo?, files:[{name,content}]}
  reflection_text      TEXT,
  ai_feedback         JSONB,  -- {scores:{decomposition,toolUsage,outputQuality,reflection}, narrative, suggestedResources}
  competency_delta     JSONB,  -- {dimension: delta} map
  version_number      INTEGER NOT NULL DEFAULT 1,
  status              submission_status NOT NULL DEFAULT 'draft',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX submissions_user_idx ON submissions(user_id);
CREATE INDEX submissions_challenge_idx ON submissions(challenge_id);
CREATE INDEX submissions_status_idx ON submissions(status);
CREATE UNIQUE INDEX submissions_unique_vote ON submissions(user_id, challenge_id, version_number);

-- ─── Peer Reviews ──────────────────────────────────────────────
CREATE TABLE peer_reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scores          JSONB NOT NULL DEFAULT '{}',
  narrative       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(submission_id, reviewer_id)
);

CREATE INDEX peer_reviews_submission_idx ON peer_reviews(submission_id);

-- ─── Courses ───────────────────────────────────────────────────
CREATE TABLE courses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  description         TEXT,
  instructor_id       UUID NOT NULL REFERENCES users(id),
  institution_id      UUID REFERENCES institutions(id) ON DELETE SET NULL,
  status              course_status NOT NULL DEFAULT 'draft',
  structure           JSONB NOT NULL DEFAULT '[]',
    -- Array of blocks: {type, id, title, ...typeSpecificFields}
  competency_weights  JSONB NOT NULL DEFAULT '{}',
  enrollment_count     INTEGER NOT NULL DEFAULT 0,
  puck_content         JSONB,  -- Raw Puck editor content
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX courses_instructor_idx ON courses(instructor_id);
CREATE INDEX courses_status_idx ON courses(status);

-- ─── Enrollments ───────────────────────────────────────────────
CREATE TABLE enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress    JSONB DEFAULT '{}',  -- {blockId: 'completed' | 'in_progress'}
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX enrollments_user_idx ON enrollments(user_id);
CREATE INDEX enrollments_course_idx ON enrollments(course_id);

-- ─── Sandbox Sessions ───────────────────────────────────────────
CREATE TABLE sandbox_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id     sandbox_template NOT NULL,
  container_id    TEXT,
  state_url       TEXT,
  version_history JSONB DEFAULT '[]',
  mistake_log     JSONB DEFAULT '[]',
  resource_usage  JSONB DEFAULT '{}',
  status          sandbox_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours')
);

CREATE INDEX sandbox_sessions_user_idx ON sandbox_sessions(user_id);
CREATE INDEX sandbox_sessions_status_idx ON sandbox_sessions(status);

-- ─── Tutor Sessions & Messages ──────────────────────────────────
CREATE TABLE tutor_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode        tutor_mode NOT NULL DEFAULT 'guide',
  context     JSONB,  -- {currentChallengeId?, currentProjectId?}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tutor_sessions_user_idx ON tutor_sessions(user_id);

CREATE TABLE tutor_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL REFERENCES tutor_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,  -- 'user' | 'assistant'
  content     TEXT NOT NULL,
  mode        tutor_mode,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tutor_messages_session_idx ON tutor_messages(session_id);

-- ─── Portfolios ────────────────────────────────────────────────
CREATE TABLE portfolios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_url_slug TEXT UNIQUE,
  artifacts       JSONB DEFAULT '[]',
    -- [{id, type, title, description, challengeId?, submissionId?, version?, contentUrl?, createdAt}]
  competency_heatmap JSONB NOT NULL DEFAULT '{}',
    -- {promptEngineering, modelEvaluation, ...} — 0-100 scores
  failure_resume  JSONB DEFAULT '[]',
    -- [{id, context, whatWentWrong, whatILearned, whatIDoDifferently, createdAt}]
  endorsements    JSONB DEFAULT '[]',
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX portfolios_user_idx ON portfolios(user_id);
CREATE INDEX portfolios_slug_idx ON portfolios(public_url_slug);

-- ─── Reflections ───────────────────────────────────────────────
CREATE TABLE reflections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id  UUID,  -- Optional link to tutor/sandbox session
  prompt      TEXT,
  content     TEXT NOT NULL,
  depth_score INTEGER CHECK (depth_score BETWEEN 1 AND 10),
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reflections_user_idx ON reflections(user_id);

-- ─── Admin: User Management ──────────────────────────────────────
CREATE TABLE admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES users(id),
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Trigger: updated_at auto-update ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at          BEFORE UPDATE ON users             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_institutions_updated_at   BEFORE UPDATE ON institutions      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_challenges_updated_at    BEFORE UPDATE ON challenges        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_submissions_updated_at    BEFORE UPDATE ON submissions       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_courses_updated_at        BEFORE UPDATE ON courses          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_portfolios_updated_at     BEFORE UPDATE ON portfolios        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS Policies (Row-Level Security) ────────────────────────
ALTER TABLE users             ENABLE ROW LEVEL POLICY;
ALTER TABLE submissions       ENABLE ROW LEVEL POLICY;
ALTER TABLE portfolios        ENABLE ROW LEVEL POLICY;
ALTER TABLE sandbox_sessions  ENABLE ROW LEVEL POLICY;
ALTER TABLE tutor_sessions    ENABLE ROW LEVEL POLICY;
ALTER TABLE courses           ENABLE ROW LEVEL POLICY;
ALTER TABLE enrollments       ENABLE ROW LEVEL POLICY;

-- Users: users can read their own row; admins can read all
CREATE POLICY users_select ON users FOR SELECT USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Submissions: users can CRUD their own; instructors can read their challenge submissions
CREATE POLICY submissions_all ON submissions FOR ALL USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM challenges c WHERE c.id = challenge_id AND c.created_by = auth.uid())
);

-- Portfolios: users own their portfolio; admins can read all
CREATE POLICY portfolios_all ON portfolios FOR ALL USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Courses: published courses are public; instructors own their courses
CREATE POLICY courses_select ON courses FOR SELECT USING (
  status = 'published' OR auth.uid() = instructor_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ─── Seed Data ──────────────────────────────────────────────────
-- Admin user (password: admin123 — change in production!)
INSERT INTO institutions (id, name, plan) VALUES
  ('00000000-0000-0000-0000-000000000001', 'VOKASI HQ', 'enterprise');

INSERT INTO users (id, email, password_hash, full_name, role, institution_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@vokasi.ai',
   crypt('admin123', gen_salt('bf')),
   'VOKASI Admin', 'admin',
   '00000000-0000-0000-0000-000000000001');

-- Weekly challenges (PRD §4)
INSERT INTO challenges (title, description, rubric, difficulty, domain_tags, is_weekly, rubric_raw_content) VALUES
  ('Evaluasilah Bias Demografis dalam Model Screening Pinjaman',
   'Anda adalah AI auditor. Dataset berisi 50.000 aplikasi pinjaman. Model ML yang digunakan menunjukkan approval rate berbeda signifikan antar kelompok demografis. Evaluasi root cause dan buat rekomendasi perbaikan.',
   '{"decomposition":{"weight":0.25,"description":"Kemampuan memecah problema kompleks menjadi komponen analitis"},"toolUsage":{"weight":0.25,"description":"Penggunaan tools dan data yang tepat"},"outputQuality":{"weight":0.25,"description":"Kualitas output dan struktur argumen"},"reflection":{"weight":0.25,"description":"Kedalaman refleksi dan pembelajaran"}}',
   'intermediate',
   ARRAY['model_evaluation'::challenge_domain, 'ai_ethics'],
   TRUE,
   'Audit Task: Given a loan screening ML model with demographic disparities, identify 3 root causes and propose mitigations. Include specific data checks and evaluation metrics.'),

  ('Red-Team Prompt Engineering: Medical Chatbot',
   'Anda diminta melakukan red-teaming terhadap chatbot kesehatan AI. Buat prompt injection attacks yang mengekspos keterbatasan model. Kemudian dokumentasikan vulnerability dan propose safe completion alternatives.',
   '{"decomposition":{"weight":0.25,"description":"Kemampuan mengidentifikasi dan dekomposisi attack surface"},"toolUsage":{"weight":0.25,"description":"Efektivitas prompt engineering techniques"},"outputQuality":{"weight":0.25,"description":"Kualitas dokumentasi keamanan"},"reflection":{"weight":0.25,"description":"Refleksi tentang implikasi etis dan mitigasi"}}',
   'advanced',
   ARRAY['prompt_engineering'::challenge_domain, 'ai_ethics'],
   TRUE,
   'Red Team Task: Design 5 prompt injection attacks targeting a medical AI assistant. For each attack, document the vulnerability class, the attack prompt, the unsafe response, and a proposed guardrail.'),

  ('AI-Powered Data Analysis: Customer Churn Dataset',
   'Analisis dataset customer churn 10.000 record. Buat pipeline analisis otomatis yang mencakup eksplorasi data, feature engineering, dan interpretasi model. Fokus pada actionable insights untuk tim product.',
   '{"decomposition":{"weight":0.20,"description":"Kemampuan memecah problema analytics"},"toolUsage":{"weight":0.25,"description":"Penggunaan library dan teknik ML yang tepat"},"outputQuality":{"weight":0.30,"description":"Kualitas insight dan rekomendasi action"},"reflection":{"weight":0.25,"description":"Pemahaman limitasi dan next steps"}}',
   'intermediate',
   ARRAY['data_analysis'::challenge_domain, 'automation'],
   TRUE,
   'Analytics Challenge: Analyze customer churn dataset. Deliver: (1) EDA summary, (2) top 5 churn drivers with evidence, (3) recommended intervention strategy with expected impact, (4) monitoring dashboard specs.'),

  ('Automation Pipeline: Social Media Monitoring System',
   'Design dan implementasikan automation pipeline yang memantau brand mentions di Twitter/X, Instagram, dan TikTok. Include sentiment analysis, alerting, dan weekly digest report generator.',
   '{"decomposition":{"weight":0.20,"description":"Kemampuan desain sistem end-to-end"},"toolUsage":{"weight":0.30,"description":"Efektivitas tool selection dan integration"},"outputQuality":{"weight":0.25,"description":"Kualitas pipeline dan error handling"},"reflection":{"weight":0.25,"description":"Refleksi tentang limitasi dan scaling"}}',
   'advanced',
   ARRAY['automation'::challenge_domain],
   FALSE,
   'Build Task: Design a social media monitoring automation pipeline. Components: data ingestion APIs, sentiment classifier, alert thresholds, digest generator. Include error handling and monitoring.'),

  ('Prompt Engineering: Zero-Shot Classification for Indonesian Legal Text',
   'Buat zero-shot classification pipeline untuk mengkategorikan dokumen hukum Indonesia ke dalam 5 kategori: contract, regulation, court_decision, legal_opinion, other. Gunakan OpenRouter API dengan model yang tepat.',
   '{"decomposition":{"weight":0.25,"description":"Kemampuan merancang prompt yang efektif untuk task spesifik"},"toolUsage":{"weight":0.25,"description":"Penggunaan API dan teknik prompt engineering"},"outputQuality":{"weight":0.25,"description":"Akurasi dan konsistensi klasifikasi"},"reflection":{"weight":0.25,"description":"Pemahaman limitation dan evaluasi metrik"}}',
   'beginner',
   ARRAY['prompt_engineering'::challenge_domain],
   FALSE,
   'Build a zero-shot Indonesian legal text classifier. Requirements: 5 categories, zero-shot approach (no training data), evaluate on 100 labeled samples, report accuracy, precision, recall, F1 per category.');

-- Default portfolio for new users (triggered on user creation)
CREATE OR REPLACE FUNCTION create_portfolio_on_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO portfolios (user_id, public_url_slug, competency_heatmap)
  VALUES (
    NEW.id,
    'user-' || substr(NEW.id::text, 1, 8),
    '{"promptEngineering":0,"modelEvaluation":0,"dataEthics":0,"automation":0,"criticalThinking":0,"collaboration":0,"communication":0,"toolFluency":0,"debugging":0,"domainApplication":0,"continuousLearning":0,"teachingOthers":0}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_portfolio
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_portfolio_on_user();

-- Grant usage to app role
-- Note: In production, create a specific app user with minimal permissions
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO vokasi_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vokasi_app;
