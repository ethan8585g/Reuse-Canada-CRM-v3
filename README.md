# Reuse Canada CRM & Operations Platform

## Project Overview
- **Name**: Reuse Canada CRM
- **Goal**: Enterprise-grade operations platform for managing tire pickups, digital scale ticketing, route planning, and customer relationship management
- **Platform**: Cloudflare Pages + Hono Framework + D1 Database
- **Company**: Reuse Canada - Alberta's Waste-to-Value Recycling Enterprise

## Completed Features

### Dual Login System
- **Customer Portal**: Separate login for tire generators (stores, shops, dealerships)
- **Employee Portal**: Secure login for Reuse Canada staff (admin, drivers, yard operators)
- Session-based authentication with 24-hour token expiry

### Customer Portal
- Submit tire pickup requests (tire count, type, preferred date/time, notes)
- View all pickup request history with status tracking
- Real-time stats (pending, scheduled, completed, total tires)

### Employee Dashboard
- Overview stats: pending pickups, today's routes, open tickets, completed today
- Recent pickup requests feed
- Recent scale tickets feed
- Quick action buttons for all modules

### Digital Scale Ticketing (Accuren Apex Indicator Integration)
- Create tickets from office or from field (iPad)
- Full weight workflow: Weight In (Gross) -> Weight Out (Tare) -> Net Weight calculated
- Ticket numbering system: RC-YYYY-NNNNN
- Status flow: field_pending -> field_complete -> weighed_in -> completed
- Void ticket capability
- Filter by status and date

### Tire Pickup Management
- View/filter all customer pickup requests
- Assign pickups to drivers with scheduled dates
- Status management: pending -> confirmed -> scheduled -> in_progress -> completed
- Rich pickup cards with customer details, tire info, notes
- Direct link to field form for on-site data collection

### Route Planning & Management
- Create routes with driver assignment and vehicle selection
- Add multiple pickup stops to routes
- Visual route stop timeline (start at yard -> stops -> return to yard)
- Route status tracking (planned, in_progress, completed)
- Unassigned pickups sidebar for easy route building
- Google Maps API integration point ready

### Field Form (iPad Optimized)
- **Step 1**: Photo capture of tire cage at customer site (camera/gallery)
- **Step 2**: Customer form (store name, employee name, estimated tire count)
- **Step 3**: Digital signature capture with touch-enabled canvas
- **Step 4**: Review & submit - creates scale ticket with all field data
- Progress indicator with 4-step visual flow
- Auto-creates scale ticket linked to pickup request
- Pre-fills customer info when coming from pickup management

## Test Credentials

### Customer Login
| Email | Password | Company |
|-------|----------|---------|
| info@kaltireauto.ca | customer123 | Kal Tire - Edmonton South |
| manager@canadiantire362.ca | customer123 | Canadian Tire #362 |
| ops@fountaintire.ca | customer123 | Fountain Tire - Sherwood Park |
| contact@ok-tire-leduc.ca | customer123 | OK Tire - Leduc |
| shop@quicklane-west.ca | customer123 | Quick Lane - West Edmonton |

### Employee Login
| Email | Password | Role |
|-------|----------|------|
| admin@reusecanada.ca | admin123 | Admin |
| mike@reusecanada.ca | driver123 | Driver |
| sarah@reusecanada.ca | driver123 | Driver |
| james@reusecanada.ca | yard123 | Yard Operator |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (customer or employee)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify session

### Customer APIs
- `GET /api/customer/pickups` - List customer's pickups
- `POST /api/customer/pickups` - Submit pickup request

### Employee APIs
- `GET /api/employee/dashboard` - Dashboard stats
- `GET /api/employee/customers` - List all customers
- `GET /api/employee/drivers` - List all drivers
- `GET /api/employee/vehicles` - List all vehicles

### Scale Tickets
- `GET /api/scale-tickets` - List tickets (filter: status, date)
- `GET /api/scale-tickets/:id` - Ticket detail
- `POST /api/scale-tickets` - Create ticket (office)
- `POST /api/scale-tickets/field` - Create ticket from field form
- `POST /api/scale-tickets/:id/weight` - Record weight (in/out)
- `POST /api/scale-tickets/:id/void` - Void ticket

### Pickup Management
- `GET /api/pickups` - List pickups (filter: status, date)
- `GET /api/pickups/:id` - Pickup detail
- `POST /api/pickups/:id/status` - Update status
- `POST /api/pickups/:id/assign` - Assign to driver

### Routing
- `GET /api/routes` - List routes (filter: date, employee)
- `GET /api/routes/:id` - Route with stops
- `POST /api/routes` - Create route with stops
- `POST /api/routes/:id/status` - Update route status

## Data Architecture
- **Database**: Cloudflare D1 (SQLite)
- **Tables**: customers, employees, sessions, pickup_requests, routes, route_stops, scale_tickets, vehicles
- **Storage**: Scale ticket photos & signatures stored as base64 in D1

## Scale Ticket Workflow
1. Driver arrives at customer site
2. Photos tire cage using iPad camera
3. Customer fills form (store name, employee name, est. tires)
4. Customer signs on iPad
5. Field form submitted -> Scale ticket created (status: field_complete)
6. Driver returns to Reuse Canada yard
7. Truck weighed on Accuren Apex indicator -> Weight In recorded (gross)
8. Tires unloaded
9. Empty truck weighed -> Weight Out recorded (tare)
10. Net weight auto-calculated -> Ticket completed

## Tech Stack
- **Backend**: Hono Framework (TypeScript)
- **Frontend**: TailwindCSS (CDN) + FontAwesome + Axios
- **Database**: Cloudflare D1 (SQLite)
- **Runtime**: Cloudflare Workers
- **Build**: Vite
- **Process Manager**: PM2

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: Development / Ready for deployment
- **Last Updated**: 2026-03-23

## Next Steps
- [ ] Google Maps API integration for live route mapping
- [ ] Accuren Apex scale indicator direct data feed integration
- [ ] Email/SMS notifications for pickup confirmations
- [ ] Customer registration workflow
- [ ] PDF scale ticket export/print
- [ ] Analytics dashboard with charts
- [ ] Role-based access control refinement
- [ ] Password hashing (bcrypt) for production
- [ ] R2 storage for photos (replace base64)
