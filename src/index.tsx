import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { customerRoutes } from './routes/customer'
import { employeeRoutes } from './routes/employee'
import { scaleTicketRoutes } from './routes/scaleTickets'
import { pickupRoutes } from './routes/pickups'
import { routeRoutes } from './routes/routing'
import { renderLogin } from './pages/login'
import { renderCustomerDashboard } from './pages/customerDashboard'
import { renderEmployeeDashboard } from './pages/employeeDashboard'
import { renderScaleTickets } from './pages/scaleTickets'
import { renderPickupManagement } from './pages/pickupManagement'
import { renderRouting } from './pages/routing'
import { renderFieldForm } from './pages/fieldForm'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// ── Middleware ──────────────────────────────
app.use('/api/*', cors())

// ── API Routes ─────────────────────────────
app.route('/api/auth', authRoutes)
app.route('/api/customer', customerRoutes)
app.route('/api/employee', employeeRoutes)
app.route('/api/scale-tickets', scaleTicketRoutes)
app.route('/api/pickups', pickupRoutes)
app.route('/api/routes', routeRoutes)

// ── Page Routes ────────────────────────────

// Landing / Login
app.get('/', (c) => c.html(renderLogin()))
app.get('/login', (c) => c.html(renderLogin()))

// Customer Pages
app.get('/customer/dashboard', (c) => c.html(renderCustomerDashboard()))
app.get('/customer/pickups', (c) => c.html(renderCustomerDashboard()))

// Employee Pages
app.get('/employee/dashboard', (c) => c.html(renderEmployeeDashboard()))
app.get('/employee/scale-tickets', (c) => c.html(renderScaleTickets()))
app.get('/employee/scale-tickets/new', (c) => c.html(renderScaleTickets()))
app.get('/employee/pickups', (c) => c.html(renderPickupManagement()))
app.get('/employee/routing', (c) => c.html(renderRouting()))
app.get('/employee/field-form/:ticketId', (c) => c.html(renderFieldForm()))
app.get('/employee/field-form', (c) => c.html(renderFieldForm()))

export default app
