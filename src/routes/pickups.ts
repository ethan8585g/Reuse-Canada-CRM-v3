import { Hono } from 'hono'
import { authMiddleware, employeeOnly } from '../middleware/auth'

type Bindings = { DB: D1Database }

export const pickupRoutes = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware
pickupRoutes.use('*', authMiddleware, employeeOnly)

// List pickup requests with filters
pickupRoutes.get('/', async (c) => {
  try {
    const status = c.req.query('status')
    const date = c.req.query('date')
    
    let sql = `SELECT pr.*, c.company_name, c.contact_name, c.phone, c.address, c.city, c.lat, c.lng,
               e.first_name || ' ' || e.last_name as assigned_employee_name
               FROM pickup_requests pr 
               LEFT JOIN customers c ON pr.customer_id = c.id 
               LEFT JOIN employees e ON pr.assigned_employee_id = e.id
               WHERE 1=1`
    const params: any[] = []
    
    if (status) {
      // Support multiple statuses via repeated param
      const statuses = status.split(',')
      sql += ` AND pr.status IN (${statuses.map(() => '?').join(',')})`
      params.push(...statuses)
    }
    if (date) {
      sql += ' AND pr.preferred_date = ?'
      params.push(date)
    }
    
    sql += ' ORDER BY pr.created_at DESC LIMIT 100'
    
    let stmt = c.env.DB.prepare(sql)
    if (params.length > 0) stmt = stmt.bind(...params)
    
    const { results } = await stmt.all()
    return c.json({ pickups: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get single pickup
pickupRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const pickup = await c.env.DB.prepare(
      `SELECT pr.*, c.company_name, c.contact_name, c.phone, c.address, c.city, c.lat, c.lng
       FROM pickup_requests pr
       LEFT JOIN customers c ON pr.customer_id = c.id
       WHERE pr.id = ?`
    ).bind(id).first()
    
    if (!pickup) return c.json({ error: 'Not found' }, 404)
    return c.json({ pickup })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Update pickup status
pickupRoutes.post('/:id/status', async (c) => {
  const id = c.req.param('id')
  try {
    const { status } = await c.req.json()
    const validStatuses = ['pending', 'confirmed', 'scheduled', 'in_progress', 'completed', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }

    await c.env.DB.prepare(
      "UPDATE pickup_requests SET status = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(status, id).run()

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Assign pickup to employee and schedule
pickupRoutes.post('/:id/assign', async (c) => {
  const id = c.req.param('id')
  try {
    const { employee_id, scheduled_date } = await c.req.json()
    
    if (!employee_id) {
      return c.json({ error: 'Employee ID is required' }, 400)
    }

    await c.env.DB.prepare(
      `UPDATE pickup_requests 
       SET assigned_employee_id = ?, preferred_date = COALESCE(?, preferred_date), 
           status = 'scheduled', updated_at = datetime('now') 
       WHERE id = ?`
    ).bind(employee_id, scheduled_date || null, id).run()

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})
