import { Hono } from 'hono'
import { authMiddleware, employeeOnly } from '../middleware/auth'

type Bindings = { DB: D1Database }

export const scaleTicketRoutes = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware
scaleTicketRoutes.use('*', authMiddleware, employeeOnly)

// Generate ticket number: RC-YYYY-NNNNN
async function generateTicketNumber(db: D1Database): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `RC-${year}-`
  const last = await db.prepare(
    "SELECT ticket_number FROM scale_tickets WHERE ticket_number LIKE ? ORDER BY id DESC LIMIT 1"
  ).bind(prefix + '%').first()
  
  let nextNum = 1
  if (last && last.ticket_number) {
    const parts = (last.ticket_number as string).split('-')
    nextNum = parseInt(parts[2]) + 1
  }
  return `${prefix}${String(nextNum).padStart(5, '0')}`
}

// List all scale tickets with filters
scaleTicketRoutes.get('/', async (c) => {
  try {
    const status = c.req.query('status')
    const date = c.req.query('date')
    
    let sql = `SELECT st.*, c.company_name, e.first_name || ' ' || e.last_name as employee_name 
               FROM scale_tickets st 
               LEFT JOIN customers c ON st.customer_id = c.id 
               LEFT JOIN employees e ON st.employee_id = e.id 
               WHERE 1=1`
    const params: any[] = []
    
    if (status) {
      sql += ' AND st.status = ?'
      params.push(status)
    }
    if (date) {
      sql += ' AND DATE(st.created_at) = ?'
      params.push(date)
    }
    
    sql += ' ORDER BY st.created_at DESC LIMIT 100'
    
    let stmt = c.env.DB.prepare(sql)
    if (params.length > 0) stmt = stmt.bind(...params)
    
    const { results } = await stmt.all()
    return c.json({ tickets: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get single ticket detail
scaleTicketRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const ticket = await c.env.DB.prepare(
      `SELECT st.*, c.company_name, c.contact_name, c.address, c.city,
              e.first_name || ' ' || e.last_name as employee_name
       FROM scale_tickets st 
       LEFT JOIN customers c ON st.customer_id = c.id 
       LEFT JOIN employees e ON st.employee_id = e.id 
       WHERE st.id = ?`
    ).bind(id).first()
    
    if (!ticket) return c.json({ error: 'Ticket not found' }, 404)
    return c.json({ ticket })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Create new scale ticket (from office/yard)
scaleTicketRoutes.post('/', async (c) => {
  try {
    const { customer_id, tire_type, notes } = await c.req.json()
    const employeeId = c.get('userId')
    
    if (!customer_id) {
      return c.json({ error: 'Customer is required' }, 400)
    }

    const ticketNumber = await generateTicketNumber(c.env.DB)
    
    const result = await c.env.DB.prepare(
      `INSERT INTO scale_tickets (ticket_number, customer_id, employee_id, tire_type, notes, status)
       VALUES (?, ?, ?, ?, ?, 'field_pending')`
    ).bind(ticketNumber, customer_id, employeeId, tire_type || 'mixed', notes || null).run()

    return c.json({ success: true, id: result.meta.last_row_id, ticket_number: ticketNumber })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Create ticket from field form (iPad)
scaleTicketRoutes.post('/field', async (c) => {
  try {
    const { 
      pickup_request_id, 
      field_store_name, 
      field_employee_name, 
      field_estimated_tires, 
      field_signature_data, 
      field_cage_photo_url 
    } = await c.req.json()
    
    const employeeId = c.get('userId')

    if (!field_store_name || !field_employee_name || !field_estimated_tires) {
      return c.json({ error: 'Store name, employee name, and tire count are required' }, 400)
    }

    const ticketNumber = await generateTicketNumber(c.env.DB)
    
    // Determine customer_id from pickup request or find by store name
    let customerId = null
    if (pickup_request_id) {
      const pickup = await c.env.DB.prepare(
        'SELECT customer_id FROM pickup_requests WHERE id = ?'
      ).bind(pickup_request_id).first()
      customerId = pickup?.customer_id
    }
    
    // If no customer found, try to match by company name
    if (!customerId) {
      const customer = await c.env.DB.prepare(
        'SELECT id FROM customers WHERE company_name LIKE ? LIMIT 1'
      ).bind('%' + field_store_name + '%').first()
      customerId = customer?.id || 1 // fallback to first customer
    }

    const now = new Date().toISOString()
    
    const result = await c.env.DB.prepare(
      `INSERT INTO scale_tickets (
        ticket_number, pickup_request_id, customer_id, employee_id,
        field_store_name, field_employee_name, field_estimated_tires,
        field_signature_data, field_cage_photo_url, field_completed_at,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'field_complete')`
    ).bind(
      ticketNumber, pickup_request_id || null, customerId, employeeId,
      field_store_name, field_employee_name, field_estimated_tires,
      field_signature_data || null, field_cage_photo_url || null, now
    ).run()

    // Update pickup request status if linked
    if (pickup_request_id) {
      await c.env.DB.prepare(
        "UPDATE pickup_requests SET status = 'in_progress', updated_at = datetime('now') WHERE id = ?"
      ).bind(pickup_request_id).run()
    }

    return c.json({ 
      success: true, 
      id: result.meta.last_row_id, 
      ticket_number: ticketNumber 
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Record weight (in or out)
scaleTicketRoutes.post('/:id/weight', async (c) => {
  const id = c.req.param('id')
  try {
    const { type, weight } = await c.req.json()
    
    if (!type || !weight || weight <= 0) {
      return c.json({ error: 'Valid weight type and value required' }, 400)
    }

    const ticket = await c.env.DB.prepare(
      'SELECT * FROM scale_tickets WHERE id = ?'
    ).bind(id).first()
    
    if (!ticket) return c.json({ error: 'Ticket not found' }, 404)

    const now = new Date().toISOString()

    if (type === 'in') {
      // Weight in (gross weight - truck + tires)
      await c.env.DB.prepare(
        `UPDATE scale_tickets SET weight_in = ?, weight_in_at = ?, status = 'weighed_in', updated_at = datetime('now') WHERE id = ?`
      ).bind(weight, now, id).run()
    } else if (type === 'out') {
      // Weight out (tare weight - empty truck)
      const netWeight = (ticket.weight_in as number) - weight
      await c.env.DB.prepare(
        `UPDATE scale_tickets SET weight_out = ?, weight_out_at = ?, net_weight = ?, status = 'completed', updated_at = datetime('now') WHERE id = ?`
      ).bind(weight, now, netWeight, id).run()

      // Complete linked pickup request
      if (ticket.pickup_request_id) {
        await c.env.DB.prepare(
          "UPDATE pickup_requests SET status = 'completed', updated_at = datetime('now') WHERE id = ?"
        ).bind(ticket.pickup_request_id).run()
      }
    } else {
      return c.json({ error: 'Type must be "in" or "out"' }, 400)
    }

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Void a ticket
scaleTicketRoutes.post('/:id/void', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(
      "UPDATE scale_tickets SET status = 'voided', updated_at = datetime('now') WHERE id = ?"
    ).bind(id).run()
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})
