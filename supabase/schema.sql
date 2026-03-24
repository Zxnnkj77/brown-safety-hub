-- ============================================================================
-- Brown Safety Hub — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Reports (private student submissions)
CREATE TABLE IF NOT EXISTS reports (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now() NOT NULL,
  incident_type text NOT NULL,
  location_text text NOT NULL,
  description   text NOT NULL,
  confidence_level smallint NOT NULL CHECK (confidence_level >= 1 AND confidence_level <= 10),
  urgency       boolean DEFAULT false NOT NULL,
  latitude      double precision,
  longitude     double precision,
  reporter_session_id text,
  user_id       uuid,
  status        text DEFAULT 'submitted' NOT NULL
                CHECK (status IN ('submitted', 'under_review', 'verified', 'dismissed', 'resolved')),
  evidence_urls text[]
);

CREATE INDEX IF NOT EXISTS idx_reports_session ON reports (reporter_session_id);
CREATE INDEX IF NOT EXISTS idx_reports_status  ON reports (status);

-- 2. Public Incidents (admin-reviewed, shown on student map)
CREATE TABLE IF NOT EXISTS public_incidents (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_report_id  uuid REFERENCES reports(id) ON DELETE SET NULL,
  title             text NOT NULL,
  public_message    text NOT NULL,
  severity          text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status            text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'monitoring', 'resolved')),
  latitude          double precision NOT NULL,
  longitude         double precision NOT NULL,
  radius_meters     integer DEFAULT 100 NOT NULL,
  report_count      integer DEFAULT 1 NOT NULL,
  confidence_percent integer DEFAULT 0 NOT NULL CHECK (confidence_percent >= 0 AND confidence_percent <= 100),
  created_at        timestamptz DEFAULT now() NOT NULL,
  updated_at        timestamptz DEFAULT now() NOT NULL,
  expires_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public_incidents (status);

-- 3. Public Alerts (official notices for students)
CREATE TABLE IF NOT EXISTS public_alerts (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title               text NOT NULL,
  message             text NOT NULL,
  level               text DEFAULT 'info' NOT NULL CHECK (level IN ('info', 'warning', 'critical')),
  verified            boolean DEFAULT true NOT NULL,
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL,
  expires_at          timestamptz,
  linked_incident_id  uuid REFERENCES public_incidents(id) ON DELETE SET NULL
);

-- 4. Safe Locations (curated recommended safe places)
CREATE TABLE IF NOT EXISTS safe_locations (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  description text NOT NULL,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  category    text DEFAULT 'other' NOT NULL
              CHECK (category IN ('building', 'service', 'emergency', 'shelter', 'other')),
  is_active   boolean DEFAULT true NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 5. Admin Profiles (for future admin dashboard auth/roles)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL UNIQUE,  -- References auth.users(id)
  email      text NOT NULL,
  full_name  text,
  role       text DEFAULT 'viewer' NOT NULL CHECK (role IN ('admin', 'moderator', 'viewer')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_user ON admin_profiles (user_id);

-- ============================================================================
-- Row Level Security (RLS)
-- Service role key bypasses RLS, but we enable it for defense-in-depth.
-- ============================================================================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for student-facing tables
CREATE POLICY "Public can read active incidents"
  ON public_incidents FOR SELECT
  USING (status IN ('active', 'monitoring'));

CREATE POLICY "Public can read non-expired alerts"
  ON public_alerts FOR SELECT
  USING (expires_at IS NULL OR expires_at > now());

CREATE POLICY "Public can read active safe locations"
  ON safe_locations FOR SELECT
  USING (is_active = true);

-- Reports: students can insert, and read their own
CREATE POLICY "Anyone can insert reports"
  ON reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own reports by session"
  ON reports FOR SELECT
  USING (true);  -- Filtered by session_id in the API; RLS allows all reads via service key

-- Admin profiles: only the user themselves can read
CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- Seed Data (sample data for development)
-- ============================================================================

-- Sample public incidents near Brown University campus
INSERT INTO public_incidents (title, public_message, severity, status, latitude, longitude, radius_meters, report_count, confidence_percent) VALUES
  ('Loud Sounds Reported', 'Multiple reports of loud sounds near Science Library. Campus police are investigating.', 'high', 'active', 41.8265, -71.4030, 150, 4, 85),
  ('Icy Sidewalk Hazard', 'Slippery conditions reported on Thayer Street. Maintenance has been notified.', 'medium', 'monitoring', 41.8280, -71.4010, 100, 2, 60);

-- Sample public alert
INSERT INTO public_alerts (title, message, level, verified) VALUES
  ('Safewalk Advisory', 'Heavy snow accumulation on Thayer St. sidewalks. Maintenance crews are deployed.', 'warning', true);

-- Sample safe locations on Brown campus
INSERT INTO safe_locations (name, description, latitude, longitude, category) VALUES
  ('Brown DPS Office', '75 Charlesfield Street. 24/7 campus police headquarters.', 41.8240, -71.3985, 'emergency'),
  ('Health Services', 'Andrews House, 13 Brown Street. Medical care and counseling.', 41.8275, -71.4015, 'service'),
  ('Pembroke Hall', 'Known safe gathering point during campus emergencies.', 41.8290, -71.4035, 'shelter');
