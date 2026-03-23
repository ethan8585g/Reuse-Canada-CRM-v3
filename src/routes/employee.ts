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

// Get all vehicles
employeeRoutes.get('/vehicles', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM vehicles WHERE is_active = 1 ORDER BY name'
    ).all()
    return c.json({ vehicles: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})
