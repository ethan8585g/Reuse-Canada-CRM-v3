-- ============================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================

-- Admin employee (password: admin123)
INSERT OR IGNORE INTO employees (email, password_hash, first_name, last_name, phone, role) VALUES 
  ('admin@reusecanada.ca', 'admin123', 'Admin', 'User', '780-555-0100', 'admin');

-- Driver employees (password: driver123)
INSERT OR IGNORE INTO employees (email, password_hash, first_name, last_name, phone, role) VALUES 
  ('mike@reusecanada.ca', 'driver123', 'Mike', 'Johnson', '780-555-0101', 'driver'),
  ('sarah@reusecanada.ca', 'driver123', 'Sarah', 'Williams', '780-555-0102', 'driver');

-- Yard operator (password: yard123)
INSERT OR IGNORE INTO employees (email, password_hash, first_name, last_name, phone, role) VALUES 
  ('james@reusecanada.ca', 'yard123', 'James', 'Brown', '780-555-0103', 'yard_operator');

-- Test customers (password: customer123)
INSERT OR IGNORE INTO customers (email, password_hash, company_name, contact_name, phone, address, city, province, postal_code, lat, lng) VALUES 
  ('info@kaltireauto.ca', 'customer123', 'Kal Tire - Edmonton South', 'David Chen', '780-555-0201', '3803 Calgary Trail NW', 'Edmonton', 'AB', 'T6J 2A8', 53.4822, -113.4909),
  ('manager@canadiantire362.ca', 'customer123', 'Canadian Tire #362', 'Lisa Park', '780-555-0202', '14023 Victoria Trail NW', 'Edmonton', 'AB', 'T5Y 0S4', 53.6010, -113.4170),
  ('ops@fountaintire.ca', 'customer123', 'Fountain Tire - Sherwood Park', 'Robert Miller', '780-555-0203', '975 Broadmoor Blvd', 'Sherwood Park', 'AB', 'T8A 5W9', 53.5344, -113.2780),
  ('contact@ok-tire-leduc.ca', 'customer123', 'OK Tire - Leduc', 'Angela Torres', '780-555-0204', '4710 50 Ave', 'Leduc', 'AB', 'T9E 6W3', 53.2594, -113.5490),
  ('shop@quicklane-west.ca', 'customer123', 'Quick Lane - West Edmonton', 'Tom Bradley', '780-555-0205', '17503 105 Ave NW', 'Edmonton', 'AB', 'T5S 1G4', 53.5421, -113.5995);

-- Sample pickup requests
INSERT OR IGNORE INTO pickup_requests (customer_id, status, estimated_tire_count, tire_type, preferred_date, preferred_time_slot, notes) VALUES 
  (1, 'pending', 85, 'mixed', '2026-03-25', 'morning', 'Tires in back lot, cage is full'),
  (2, 'confirmed', 120, 'passenger', '2026-03-25', 'afternoon', 'Two cages ready'),
  (3, 'pending', 45, 'truck', '2026-03-26', 'anytime', 'Large truck tires, need flatbed'),
  (4, 'scheduled', 60, 'passenger', '2026-03-24', 'morning', 'Regular weekly pickup'),
  (5, 'pending', 200, 'mixed', '2026-03-27', 'morning', 'Seasonal rush - extra tires');

-- Sample vehicles
INSERT OR IGNORE INTO vehicles (name, plate_number, vehicle_type, tare_weight) VALUES
  ('Truck 1 - Flatbed', 'ABC-1234', 'flatbed', 8200),
  ('Truck 2 - Roll-Off', 'DEF-5678', 'roll_off', 12500),
  ('Van 1 - Cube', 'GHI-9012', 'cube_van', 4800);
