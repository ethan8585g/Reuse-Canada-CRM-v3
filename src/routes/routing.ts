import { Hono } from 'hono'
import { authMiddleware, employeeOnly } from '../middleware/auth'

type Bindings = { DB: D1Database }

export const routeRoutes = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware
routeRoutes.use('*', authMiddleware, employeeOnly)

// List routes with filters
routeRoutes.get('/', async (c) => {
  try {
    const date = c.req.query('date')
    const employeeId = c.req.query('employee_id')
    
    let sql = `SELECT r.*, e.first_name || ' ' || e.last_name as driver_name,
               (SELECT COUNT(*) FROM route_stops rs WHERE rs.route_id = r.id) as stop_count
               FROM routes r 
               LEFT JOIN employees e ON r.assigned_employee_id = e.id
               WHERE 1=1`
    const params: any[] = []
    
    if (date) {
      sql += ' AND r.date = ?'
      params.push(date)
    }
    if (employeeId) {
      sql += ' AND r.assigned_employee_id = ?'
      params.push(employeeId)
    }
    
    sql += ' ORDER BY r.date DESC, r.created_at DESC LIMIT 50'
    
    let stmt = c.env.DB.prepare(sql)
    if (params.length > 0) stmt = stmt.bind(...params)
    
    const { results } = await stmt.all()
    return c.json({ routes: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get single route with stops
routeRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const route = await c.env.DB.prepare(
      `SELECT r.*, e.first_name || ' ' || e.last_name as driver_name
       FROM routes r
       LEFT JOIN employees e ON r.assigned_employee_id = e.id
       WHERE r.id = ?`
    ).bind(id).first()
    
    if (!route) return c.json({ error: 'Route not found' }, 404)

    const { results: stops } = await c.env.DB.prepare(
      `SELECT rs.*, c.company_name, c.contact_name, c.phone, c.address, c.city, c.lat, c.lng,
              pr.estimated_tire_count, pr.tire_type
       FROM route_stops rs
       LEFT JOIN customers c ON rs.customer_id = c.id
       LEFT JOIN pickup_requests pr ON rs.pickup_request_id = pr.id
       WHERE rs.route_id = ?
       ORDER BY rs.stop_order`
    ).bind(id).all()

    return c.json({ route, stops })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Create new route
routeRoutes.post('/', async (c) => {
  try {
    const { name, date, assigned_employee_id, vehicle, pickup_ids, notes } = await c.req.json()
    
    if (!name || !date || !assigned_employee_id) {
      return c.json({ error: 'Name, date, and driver are required' }, 400)
    }

    // Create route
    const result = await c.env.DB.prepare(
      `INSERT INTO routes (name, date, assigned_employee_id, vehicle, notes) VALUES (?, ?, ?, ?, ?)`
    ).bind(name, date, assigned_employee_id, vehicle || null, notes || null).run()

    const routeId = result.meta.last_row_id

    // Add pickup stops
    if (pickup_ids && pickup_ids.length > 0) {
      for (let i = 0; i < pickup_ids.length; i++) {
        const pickupId = pickup_ids[i]
        
        // Get pickup details for customer_id
        const pickup = await c.env.DB.prepare(
          'SELECT customer_id FROM pickup_requests WHERE id = ?'
        ).bind(pickupId).first()
        
        if (pickup) {
          await c.env.DB.prepare(
            `INSERT INTO route_stops (route_id, pickup_request_id, customer_id, stop_order) VALUES (?, ?, ?, ?)`
          ).bind(routeId, pickupId, pickup.customer_id, i + 1).run()

          // Update pickup status to scheduled and assign route
          await c.env.DB.prepare(
            `UPDATE pickup_requests SET status = 'scheduled', assigned_employee_id = ?, assigned_route_id = ?, updated_at = datetime('now') WHERE id = ?`
          ).bind(assigned_employee_id, routeId, pickupId).run()
        }
      }
    }

    return c.json({ success: true, id: routeId })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Update route status
routeRoutes.post('/:id/status', async (c) => {
  const id = c.req.param('id')
  try {
    const { status } = await c.req.json()
    const validStatuses = ['planned', 'in_progress', 'completed']
    
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }

    const updates: any = { status }
    let sql = "UPDATE routes SET status = ?, updated_at = datetime('now')"
    const params: any[] = [status]
    
    if (status === 'in_progress') {
      sql += ", started_at = datetime('now')"
    } else if (status === 'completed') {
      sql += ", completed_at = datetime('now')"
    }
    
    sql += ' WHERE id = ?'
    params.push(id)
    
    await c.env.DB.prepare(sql).bind(...params).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Update route stop status
routeRoutes.post('/:routeId/stops/:stopId/status', async (c) => {
  const stopId = c.req.param('stopId')
  try {
    const { status } = await c.req.json()
    const validStatuses = ['pending', 'arrived', 'completed', 'skipped']
    
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }

    const now = new Date().toISOString()
    let sql = 'UPDATE route_stops SET status = ?'
    const params: any[] = [status]
    
    if (status === 'arrived') {
      sql += ', arrived_at = ?'
      params.push(now)
    } else if (status === 'completed') {
      sql += ', departed_at = ?'
      params.push(now)
    }
    
    sql += ' WHERE id = ?'
    params.push(stopId)
    
    await c.env.DB.prepare(sql).bind(...params).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})
