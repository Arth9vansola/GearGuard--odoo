-- GearGuard schema
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('user','technician','manager')) NOT NULL,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS maintenance_teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id INT REFERENCES maintenance_teams(id),
  user_id INT REFERENCES users(id),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  category TEXT,
  purchase_date DATE,
  warranty_info TEXT,
  location TEXT,
  department TEXT,
  assigned_employee TEXT,
  maintenance_team_id INT REFERENCES maintenance_teams(id),
  is_scrapped BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  request_type TEXT CHECK (request_type IN ('corrective','preventive')),
  equipment_id INT REFERENCES equipment(id),
  maintenance_team_id INT REFERENCES maintenance_teams(id),
  assigned_technician INT REFERENCES users(id),
  scheduled_date DATE,
  duration_hours NUMERIC,
  status TEXT CHECK (status IN ('new','in_progress','repaired','scrap')) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
