-- ============================================
-- MIGRATION 0002: Scale House Pricing & Payments
-- ============================================

-- Add pricing and payment fields to scale_tickets
ALTER TABLE scale_tickets ADD COLUMN price_per_kg REAL DEFAULT 0.0;
ALTER TABLE scale_tickets ADD COLUMN total_amount REAL DEFAULT 0.0;
ALTER TABLE scale_tickets ADD COLUMN tax_rate REAL DEFAULT 0.05;
ALTER TABLE scale_tickets ADD COLUMN tax_amount REAL DEFAULT 0.0;
ALTER TABLE scale_tickets ADD COLUMN grand_total REAL DEFAULT 0.0;
ALTER TABLE scale_tickets ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE scale_tickets ADD COLUMN payment_method TEXT;
ALTER TABLE scale_tickets ADD COLUMN square_payment_id TEXT;
ALTER TABLE scale_tickets ADD COLUMN square_checkout_id TEXT;
ALTER TABLE scale_tickets ADD COLUMN vehicle_id INTEGER REFERENCES vehicles(id);
ALTER TABLE scale_tickets ADD COLUMN vehicle_plate TEXT;
ALTER TABLE scale_tickets ADD COLUMN printed INTEGER DEFAULT 0;
ALTER TABLE scale_tickets ADD COLUMN printed_at DATETIME;

-- Pricing table for different material types
CREATE TABLE IF NOT EXISTS pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_type TEXT NOT NULL UNIQUE,
  description TEXT,
  price_per_kg REAL NOT NULL DEFAULT 0.0,
  price_per_tire REAL DEFAULT 0.0,
  is_active INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pricing
INSERT OR IGNORE INTO pricing (material_type, description, price_per_kg, price_per_tire) VALUES
  ('passenger', 'Passenger & Light Truck Tires', 0.15, 4.00),
  ('truck', 'Commercial Truck Tires', 0.12, 15.00),
  ('mixed', 'Mixed Tires', 0.14, 5.00),
  ('off-road', 'Off-Road / Agricultural Tires', 0.10, 25.00),
  ('shingles', 'Asphalt Shingles', 0.08, 0.0),
  ('scrap_metal', 'Scrap Metal', 0.45, 0.0);

-- Payment log
CREATE TABLE IF NOT EXISTS payment_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scale_ticket_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  square_payment_id TEXT,
  square_checkout_id TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scale_ticket_id) REFERENCES scale_tickets(id)
);

CREATE INDEX IF NOT EXISTS idx_payment_log_ticket ON payment_log(scale_ticket_id);
CREATE INDEX IF NOT EXISTS idx_scale_tickets_payment ON scale_tickets(payment_status);
