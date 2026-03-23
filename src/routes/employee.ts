import { Hono } from 'hono'
import { authMiddleware, employeeOnly } from '../middleware/auth'

type Bindings = { DB: D1Database }

export const employeeRoutes = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware
employeeRoutes.use('*', authMiddleware, employeeOnly)

// Dashboard data
employeeRoutes.get('/dashboard', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const [pendingPickups, todaysRoutes, openTickets, completedToday, recentPickups, recentTickets] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM pickup_requests WHERE status IN ('pending', 'confirmed')").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM routes WHERE date = ?").bind(today).first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM scale_tickets WHERE status NOT IN ('completed', 'voided')").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM scale_tickets WHERE status = 'completed' AND DATE(updated_at) = ?").bind(today).first(),
      c.env.DB.prepare(
        "SELECT pr.*, c.company_name, c.contact_name FROM pickup_requests pr LEFT JOIN customers c ON pr.customer_id = c.id ORDER BY pr.created_at DESC LIMIT 5"
      ).all(),
      c.env.DB.prepare(
        "SELECT st.*, c.company_name, e.first_name || ' ' || e.last_name as employee_name FROM scale_tickets st LEFT JOIN customers c ON st.customer_id = c.id LEFT JOIN employees e ON st.employee_id = e.id ORDER BY st.created_at DESC LIMIT 5"
      ).all(),
    ])

    return c.json({
      pending_pickups: (pendingPickups as any)?.count || 0,
      todays_routes: (todaysRoutes as any)?.count || 0,
      open_tickets: (openTickets as any)?.count || 0,
      completed_today: (completedToday as any)?.count || 0,
      recent_pickups: recentPickups.results || [],
      recent_tickets: recentTickets.results || [],
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get all customers (for dropdowns)
employeeRoutes.get('/customers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, company_name, contact_name, phone, address, city, province, postal_code, lat, lng FROM customers WHERE is_active = 1 ORDER BY company_name'
    ).all()
    return c.json({ customers: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get all drivers
employeeRoutes.get('/drivers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, first_name, last_name, phone, role FROM employees WHERE is_active = 1 AND role IN ('driver', 'admin', 'manager') ORDER BY first_name"
    ).all()
    return c.json({ drivers: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get all vehicles (active by default, add ?all=true for all)
employeeRoutes.get('/vehicles', async (c) => {
  try {
    const showAll = c.req.query('all')
    const sql = showAll ? 'SELECT * FROM vehicles ORDER BY name' : 'SELECT * FROM vehicles WHERE is_active = 1 ORDER BY name'
    const { results } = await c.env.DB.prepare(sql).all()
    return c.json({ vehicles: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// ══════════════════════════════════════════
// CUSTOMER ONBOARDING (CRUD)
// ══════════════════════════════════════════

// Get all customers (full details for management)
employeeRoutes.get('/customers/all', async (c) => {
  try {
    const status = c.req.query('status') // active, inactive, all
    let sql = `SELECT c.id, c.email, c.company_name, c.contact_name, c.phone, c.address, c.city, c.province, c.postal_code, c.lat, c.lng, c.notes, c.is_active, c.created_at, c.updated_at,
               (SELECT COUNT(*) FROM pickup_requests pr WHERE pr.customer_id = c.id AND pr.status IN ('pending','confirmed')) as pending_pickups
               FROM customers c`
    if (status === 'active') { sql += ' WHERE c.is_active = 1'; }
    else if (status === 'inactive') { sql += ' WHERE c.is_active = 0'; }
    sql += ' ORDER BY c.company_name'
    const { results } = await c.env.DB.prepare(sql).all()
    return c.json({ customers: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Create new customer
employeeRoutes.post('/customers', async (c) => {
  try {
    const { email, password, company_name, contact_name, phone, address, city, province, postal_code, lat, lng, notes } = await c.req.json()
    if (!email || !password || !company_name || !contact_name) {
      return c.json({ error: 'Username, password, company name, and contact name are required' }, 400)
    }
    // Check for duplicate email/username
    const existing = await c.env.DB.prepare('SELECT id FROM customers WHERE LOWER(email) = LOWER(?)').bind(email.trim()).first()
    if (existing) {
      return c.json({ error: 'A customer with this username already exists' }, 409)
    }
    const result = await c.env.DB.prepare(
      `INSERT INTO customers (email, password_hash, company_name, contact_name, phone, address, city, province, postal_code, lat, lng, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      email.trim(), password, company_name, contact_name,
      phone || null, address || null, city || null, province || 'AB',
      postal_code || null, lat || null, lng || null, notes || null
    ).run()
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Update customer
employeeRoutes.put('/customers/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    const fields: string[] = []
    const params: any[] = []
    const allowed = ['email','company_name','contact_name','phone','address','city','province','postal_code','lat','lng','notes','is_active']
    for (const key of allowed) {
      if (body[key] !== undefined) { fields.push(`${key} = ?`); params.push(body[key]); }
    }
    if (body.password) { fields.push('password_hash = ?'); params.push(body.password); }
    if (fields.length === 0) return c.json({ error: 'No fields to update' }, 400)
    fields.push("updated_at = datetime('now')")
    params.push(id)
    await c.env.DB.prepare(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Toggle customer active/inactive
employeeRoutes.post('/customers/:id/toggle', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(
      "UPDATE customers SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?"
    ).bind(id).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// ══════════════════════════════════════════
// DRIVER / EMPLOYEE MANAGEMENT (CRUD)
// ══════════════════════════════════════════

// Get all employees (full details for management)
employeeRoutes.get('/staff', async (c) => {
  try {
    const role = c.req.query('role')
    let sql = 'SELECT id, email, first_name, last_name, phone, role, is_active, created_at, updated_at FROM employees'
    const params: any[] = []
    if (role) { sql += ' WHERE role = ?'; params.push(role); }
    sql += ' ORDER BY first_name'
    let stmt = c.env.DB.prepare(sql)
    if (params.length > 0) stmt = stmt.bind(...params)
    const { results } = await stmt.all()
    return c.json({ employees: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Create new employee/driver
employeeRoutes.post('/staff', async (c) => {
  try {
    const { email, password, first_name, last_name, phone, role } = await c.req.json()
    if (!email || !password || !first_name || !last_name || !role) {
      return c.json({ error: 'Email, password, first name, last name, and role are required' }, 400)
    }
    const validRoles = ['admin','manager','driver','yard_operator']
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Invalid role. Must be: ' + validRoles.join(', ') }, 400)
    }
    const existing = await c.env.DB.prepare('SELECT id FROM employees WHERE LOWER(email) = LOWER(?)').bind(email.trim()).first()
    if (existing) {
      return c.json({ error: 'An employee with this email already exists' }, 409)
    }
    const result = await c.env.DB.prepare(
      'INSERT INTO employees (email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(email.trim(), password, first_name, last_name, phone || null, role).run()
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Update employee
employeeRoutes.put('/staff/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    const fields: string[] = []
    const params: any[] = []
    const allowed = ['email','first_name','last_name','phone','role','is_active']
    for (const key of allowed) {
      if (body[key] !== undefined) { fields.push(`${key} = ?`); params.push(body[key]); }
    }
    if (body.password) { fields.push('password_hash = ?'); params.push(body.password); }
    if (fields.length === 0) return c.json({ error: 'No fields to update' }, 400)
    fields.push("updated_at = datetime('now')")
    params.push(id)
    await c.env.DB.prepare(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Toggle employee active/inactive
employeeRoutes.post('/staff/:id/toggle', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(
      "UPDATE employees SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?"
    ).bind(id).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// ══════════════════════════════════════════
// VEHICLE MANAGEMENT (CRUD)
// ══════════════════════════════════════════

// Create new vehicle
employeeRoutes.post('/vehicles', async (c) => {
  try {
    const { name, plate_number, vehicle_type, tare_weight } = await c.req.json()
    if (!name || !plate_number || !vehicle_type) {
      return c.json({ error: 'Name, plate number, and vehicle type are required' }, 400)
    }
    const existing = await c.env.DB.prepare('SELECT id FROM vehicles WHERE LOWER(plate_number) = LOWER(?)').bind(plate_number.trim()).first()
    if (existing) {
      return c.json({ error: 'A vehicle with this plate number already exists' }, 409)
    }
    const result = await c.env.DB.prepare(
      'INSERT INTO vehicles (name, plate_number, vehicle_type, tare_weight) VALUES (?, ?, ?, ?)'
    ).bind(name, plate_number.trim().toUpperCase(), vehicle_type, tare_weight || 0).run()
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Update vehicle
employeeRoutes.put('/vehicles/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    const fields: string[] = []
    const params: any[] = []
    const allowed = ['name', 'plate_number', 'vehicle_type', 'tare_weight', 'is_active']
    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`)
        params.push(key === 'plate_number' ? String(body[key]).trim().toUpperCase() : body[key])
      }
    }
    if (fields.length === 0) return c.json({ error: 'No fields to update' }, 400)
    fields.push("updated_at = datetime('now')")
    params.push(id)
    await c.env.DB.prepare(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Toggle vehicle active/inactive
employeeRoutes.post('/vehicles/:id/toggle', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(
      "UPDATE vehicles SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?"
    ).bind(id).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})
