-- ==============================================================================
-- LabLink: GenAI-Powered Campus Laboratory Resource-Sharing Platform
-- Supabase PostgreSQL Schema Migration
-- ==============================================================================

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  building TEXT NOT NULL,
  head_of_department TEXT NOT NULL,
  total_labs INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL
);

-- 2. LABORATORIES
CREATE TABLE IF NOT EXISTS laboratories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  building TEXT,
  manager_id TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  operating_hours JSONB NOT NULL,
  safety_tier INTEGER NOT NULL DEFAULT 1 CHECK (safety_tier IN (1, 2, 3)),
  contact_email TEXT NOT NULL,
  image_url TEXT
);

-- 3. EQUIPMENT
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL REFERENCES laboratories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  specs JSONB NOT NULL DEFAULT '{}'::JSONB,
  condition TEXT NOT NULL DEFAULT 'optimal',
  availability TEXT NOT NULL DEFAULT 'available',
  prerequisites JSONB NOT NULL DEFAULT '[]'::JSONB,
  qr_code_id TEXT NOT NULL,
  hourly_operating_cost NUMERIC,
  replacement_cost NUMERIC,
  max_booking_hours_per_slot INTEGER NOT NULL DEFAULT 4,
  location_details TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  total_hours_logged NUMERIC NOT NULL DEFAULT 0,
  last_maintenance_date TEXT NOT NULL,
  next_maintenance_date TEXT NOT NULL,
  equivalent_equipment_ids JSONB DEFAULT '[]'::JSONB,
  svg_icon_type TEXT
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'lab_manager', 'admin')),
  department_id TEXT NOT NULL,
  avatar_url TEXT,
  prior_usage_hours NUMERIC NOT NULL DEFAULT 0,
  completed_trainings JSONB NOT NULL DEFAULT '[]'::JSONB,
  active_project_ids JSONB NOT NULL DEFAULT '[]'::JSONB
);

-- 5. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  lead_student_id TEXT NOT NULL,
  team_members JSONB NOT NULL DEFAULT '[]'::JSONB,
  faculty_supervisor_id TEXT NOT NULL,
  deadline TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'proposed')),
  required_equipment_categories JSONB NOT NULL DEFAULT '[]'::JSONB,
  attached_requirements JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TEXT NOT NULL
);

-- 6. BOOKING REQUESTS
CREATE TABLE IF NOT EXISTS booking_requests (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  purpose TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  urgency_score NUMERIC,
  allocated_slot JSONB,
  rejection_reason TEXT,
  faculty_comment TEXT
);

-- 7. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL REFERENCES laboratories(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  checked_in_at TEXT,
  checked_out_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 8. CONFLICT CASES
CREATE TABLE IF NOT EXISTS conflicts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  contending_request_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
  detected_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'detected',
  target_window JSONB NOT NULL,
  resolution JSONB,
  is_hero_scenario BOOLEAN DEFAULT FALSE
);

-- 9. MAINTENANCE RECORDS
CREATE TABLE IF NOT EXISTS maintenance_records (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL REFERENCES laboratories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scheduled_start TEXT NOT NULL,
  scheduled_end TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'routine',
  status TEXT NOT NULL DEFAULT 'scheduled',
  cost NUMERIC
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TEXT NOT NULL
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL
);

-- 12. ENGINE WEIGHT CONFIGURATION
CREATE TABLE IF NOT EXISTS engine_weights (
  id TEXT PRIMARY KEY DEFAULT 'default',
  deadline_urgency NUMERIC NOT NULL DEFAULT 0.30,
  project_priority NUMERIC NOT NULL DEFAULT 0.20,
  waiting_time NUMERIC NOT NULL DEFAULT 0.20,
  usage_fairness NUMERIC NOT NULL DEFAULT 0.15,
  requirement_criticality NUMERIC NOT NULL DEFAULT 0.15,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_dept ON equipment(department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_lab ON equipment(lab_id);
CREATE INDEX IF NOT EXISTS idx_equipment_availability ON equipment(availability);
CREATE INDEX IF NOT EXISTS idx_laboratories_dept ON laboratories(department_id);
CREATE INDEX IF NOT EXISTS idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_booking_requests_equipment ON booking_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_projects_lead ON projects(lead_student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- In demo mode, anon users can select, insert, update, and delete
-- ==============================================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_weights ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo operation (anon & authenticated)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'departments', 'laboratories', 'equipment', 'users',
    'projects', 'booking_requests', 'bookings', 'conflicts',
    'maintenance_records', 'notifications', 'audit_logs', 'engine_weights'
  ])
  LOOP
    EXECUTE format('GRANT ALL ON TABLE %s TO anon, authenticated, service_role;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public access policy on %s" ON %s;', t, t);
    EXECUTE format('CREATE POLICY "Public access policy on %s" ON %s FOR ALL TO public USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

