-- ============================================
-- REUSE CANADA CRM & OPERATIONS PLATFORM
-- Initial Database Schema
-- ============================================

-- ===================
-- AUTHENTICATION & USERS
-- ===================

-- Customers (tire generators - stores, shops, etc.)
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT DEFAULT 'AB',
  postal_code TEXT,
  lat REAL,
  lng REAL,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employees (Reuse Canada staff)
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'driver', -- admin, manager, driver, yard_operator
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions for both customer and employee auth
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- UUID token
  user_id INTEGER NOT NULL,
  user_type TEXT NOT NULL CHECK(user_type IN ('customer', 'employee')),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===================
-- TIRE PICKUP REQUESTS
-- ===================

CREATE TABLE IF NOT EXISTS pickup_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', 
  -- pending, confirmed, scheduled, in_progress, completed, cancelled
  estimated_tire_count INTEGER,
  tire_type TEXT, -- passenger, truck, mixed, off-road
  preferred_date TEXT, -- requested pickup date
  preferred_time_slot TEXT, -- morning, afternoon, anytime
  notes TEXT,
  assigned_employee_id INTEGER,
  assigned_route_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (assigned_employee_id) REFERENCES employees(id)
);

-- ===================
-- ROUTING
-- ===================

CREATE TABLE IF NOT EXISTS routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL, -- route date YYYY-MM-DD
  assigned_employee_id INTEGER NOT NULL,
  vehicle TEXT, -- truck identifier
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in_progress, completed
  total_distance_km REAL,
  total_duration_minutes INTEGER,
  optimized_order TEXT, -- JSON array of stop order
  notes TEXT,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS route_stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  pickup_request_id INTEGER,
  customer_id INTEGER NOT NULL,
  stop_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, arrived, completed, skipped
  arrived_at DATETIME,
  departed_at DATETIME,
  notes TEXT,
  FOREIGN KEY (route_id) REFERENCES routes(id),
  FOREIGN KEY (pickup_request_id) REFERENCES pickup_requests(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- ===================
-- SCALE TICKETS
-- ===================

CREATE TABLE IF NOT EXISTS scale_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT UNIQUE NOT NULL, -- e.g. RC-2026-00001
  pickup_request_id INTEGER,
  customer_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  route_stop_id INTEGER,

  -- Field data (collected at customer site on iPad)
  field_store_name TEXT,
  field_employee_name TEXT,
  field_estimated_tires INTEGER,
  field_signature_data TEXT, -- base64 signature image
  field_cage_photo_url TEXT, -- photo of tire cage
  field_notes TEXT,
  field_completed_at DATETIME,

  -- Scale data (completed at Reuse Canada yard)
  weight_in REAL, -- gross weight in kg
  weight_in_at DATETIME,
  weight_out REAL, -- tare weight in kg
  weight_out_at DATETIME,
  net_weight REAL, -- calculated: weight_in - weight_out
  
  -- Ticket metadata
  tire_type TEXT, -- passenger, truck, mixed, off-road
  tire_count_actual INTEGER, -- actual count if different from estimate
  material_grade TEXT, -- A, B, C grade
  status TEXT NOT NULL DEFAULT 'field_pending',
  -- field_pending, field_complete, weighing_in, weighed_in, weighing_out, completed, voided
  
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pickup_request_id) REFERENCES pickup_requests(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (route_stop_id) REFERENCES route_stops(id)
);

-- ===================
-- VEHICLES / TRUCKS
-- ===================

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- e.g. "Truck 1", "Flatbed 2"
  plate_number TEXT,
  vehicle_type TEXT, -- flatbed, roll-off, cube_van
  tare_weight REAL, -- known empty weight in kg
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===================
-- INDEXES
-- ===================

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_customer ON pickup_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_assigned ON pickup_requests(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_routes_date ON routes(date);
CREATE INDEX IF NOT EXISTS idx_routes_employee ON routes(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_scale_tickets_number ON scale_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_scale_tickets_customer ON scale_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_scale_tickets_employee ON scale_tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_scale_tickets_status ON scale_tickets(status);
