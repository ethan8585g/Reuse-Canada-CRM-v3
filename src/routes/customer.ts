import { Hono } from 'hono'
import { authMiddleware, customerOnly } from '../middleware/auth'

type Bindings = { DB: D1Database }

export const customerRoutes = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware to all customer routes
customerRoutes.use('*', authMiddleware, customerOnly)

// Get customer's pickup requests
customerRoutes.get('/pickups', async (c) => {
  const customerId = c.get('userId')
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM pickup_requests WHERE customer_id = ? ORDER BY created_at DESC'
    ).bind(customerId).all()
    return c.json({ pickups: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Submit new pickup request
customerRoutes.post('/pickups', async (c) => {
  const customerId = c.get('userId')
  try {
    const { estimated_tire_count, tire_type, preferred_date, preferred_time_slot, notes } = await c.req.json()
    
    if (!estimated_tire_count || !tire_type) {
      return c.json({ error: 'Tire count and type are required' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO pickup_requests (customer_id, estimated_tire_count, tire_type, preferred_date, preferred_time_slot, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(customerId, estimated_tire_count, tire_type, preferred_date || null, preferred_time_slot || 'anytime', notes || null).run()

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get single pickup request
customerRoutes.get('/pickups/:id', async (c) => {
  const customerId = c.get('userId')
  const pickupId = c.req.param('id')
  try {
    const pickup = await c.env.DB.prepare(
      'SELECT * FROM pickup_requests WHERE id = ? AND customer_id = ?'
    ).bind(pickupId, customerId).first()
    if (!pickup) return c.json({ error: 'Not found' }, 404)
    return c.json({ pickup })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})
