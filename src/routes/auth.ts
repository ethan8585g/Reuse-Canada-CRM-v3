import { Hono } from 'hono'

type Bindings = { DB: D1Database }

export const authRoutes = new Hono<{ Bindings: Bindings }>()

// Generate simple UUID-like token
function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Login endpoint for both customer and employee
authRoutes.post('/login', async (c) => {
  try {
    const { email, password, user_type } = await c.req.json()
    
    if (!email || !password || !user_type) {
      return c.json({ error: 'Email, password and user type are required' }, 400)
    }

    let user: any = null
    
    if (user_type === 'customer') {
      user = await c.env.DB.prepare(
        'SELECT id, email, company_name, contact_name, phone, address, city, province, postal_code, password_hash FROM customers WHERE email = ? AND is_active = 1'
      ).bind(email.toLowerCase().trim()).first()
    } else if (user_type === 'employee') {
      user = await c.env.DB.prepare(
        'SELECT id, email, first_name, last_name, phone, role, password_hash FROM employees WHERE email = ? AND is_active = 1'
      ).bind(email.toLowerCase().trim()).first()
    } else {
      return c.json({ error: 'Invalid user type' }, 400)
    }

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Simple password check (in production, use proper hashing like bcrypt)
    if (user.password_hash !== password) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, user_type, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(token, user.id, user_type, expiresAt).run()

    // Build response based on user type
    if (user_type === 'customer') {
      return c.json({
        token,
        user_type: 'customer',
        user_id: user.id,
        email: user.email,
        company_name: user.company_name,
        name: user.contact_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
      })
    } else {
      return c.json({
        token,
        user_type: 'employee',
        user_id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      })
    }
  } catch (err: any) {
    console.error('Login error:', err)
    return c.json({ error: 'Login failed: ' + err.message }, 500)
  }
})

// Logout
authRoutes.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    try {
      await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run()
    } catch (e) {}
  }
  return c.json({ success: true })
})

// Verify session
authRoutes.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ valid: false }, 401)
  }
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const session = await c.env.DB.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(token).first()
    
    return c.json({ valid: !!session, user_type: session?.user_type, user_id: session?.user_id })
  } catch (err) {
    return c.json({ valid: false }, 500)
  }
})
