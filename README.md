# Reuse Canada — CRM & Operations Platform

## Project Overview
- **Name**: Reuse Canada CRM
- **Goal**: Unified platform for managing tire pickup logistics, digital scale ticketing, customer relationships, and route planning
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare Workers (D1 SQLite)

## Live URLs
- **GitHub**: https://github.com/ethan8585g/Reuse-Canada-CRM-v3

## Login Credentials

### Customer Portal
| Username | Password | Company |
|----------|----------|---------|
| KALTIRE | TIRES! | Kal Tire - Edmonton South |
| GOINGTIRE | Tires2024! | Going Tire - Spruce Grove |

### Employee Portal
| Email | Password | Role |
|-------|----------|------|
| Ethan@reuse-canada.ca | Tires123! | Admin |
| admin@reusecanada.ca | admin123 | Admin |
| mike@reusecanada.ca | driver123 | Driver |
| sarah@reusecanada.ca | driver123 | Driver |
| james@reusecanada.ca | yard123 | Yard Operator |
| dave@reusecanada.ca | driver123 | Driver |

## Completed Features

### 1. Dual Login System (`/`)
- Customer Portal (green) -- username-based login
- Employee Portal (dark gray) -- email-based login
- Session management with token auth
- Auto-redirect if already logged in
- Case-insensitive login matching
- Expired session cleanup on login

### 2. Employee Dashboard (`/employee/dashboard`)
- **Clickable stat cards** -- Pending Pickups, Today's Routes, Open Scale Tickets, Completed Today all link directly to their respective pages
- Recent pickup requests and scale tickets with status badges
- Quick action cards: Scale House, Manage Pickups, Plan Routes, Onboard Customer, Add Driver, Field Form
- Refresh button and pending badge with pulse animation
- Axios CDN fallback and safety checks

### 3. Customer Onboarding & Management (`/employee/customers`)
- **Full CRUD** for customer accounts
- Create customer with: username, password, company name, contact, phone, address, city, province, postal code, notes
- Edit existing customer details (including password reset)
- Activate / deactivate customer accounts
- Search by company, contact, city, or username
- Filter by active/inactive status
- Stats: Total Active, Total Inactive, Pending Pickups (live from DB), Added This Month
- Pending pickups count shown per-customer in the table

### 4. Driver & Staff Management (`/employee/drivers`)
- **Tabbed interface**: Staff tab and Vehicles tab
- **Staff management**: Create/edit/toggle employees with roles (admin, manager, driver, yard_operator)
- Role-based card display with color-coded badges and icons
- Password management for all staff accounts
- Phone and role assignment
- **Vehicle Management** (Vehicles tab):
  - Create/edit/toggle vehicles
  - Vehicle types: flatbed, roll-off, cube van, pickup, trailer
  - Plate number and tare weight tracking
  - Active/inactive status management

### 5. Scale House (`/employee/scale-house`)
Full-featured scale house ticketing station:
- **Bluetooth Accuren Apex Integration**: Web Bluetooth API connects to the Apex indicator via BLE
- **3-Step Workflow**: Create Ticket -> Capture Weight In (Gross) -> Capture Weight Out (Tare) -> Auto-calculate Net Weight
- **Auto Pricing**: Pulls rates from pricing table by material type. Calculates subtotal + 5% GST
- **Square Terminal Payment**: Sends $ amount to Square Reader for card tap/insert
- **Receipt Printing**: 80mm thermal receipt layout with REUSE CANADA branding
- **Ticket Queue**: Shows all active/pending tickets in sidebar (now supports multi-status filter)
- **Simulation Mode**: "Sim" button for testing without physical scale hardware

### 6. Scale Ticket History (`/employee/scale-tickets`)
- Full ticket list with search/filter by status and date
- Ticket detail modal with all field data, weight history, and field photos/signatures
- Weigh-in and weigh-out actions from the table
- Void ticket functionality

### 7. Customer Dashboard (`/customer/dashboard`)
- Submit tire pickup requests (count, type, date, time preference, notes)
- View request status and history with color-coded status badges
- Stats: Pending, Scheduled, Completed, Total Tires
- Axios safety checks and retry logic

### 8. Pickup Management (`/employee/pickups`)
- Pickup request cards with full details (customer, address, tires, dates)
- Driver assignment modal with date scheduling
- Status lifecycle: pending -> confirmed -> scheduled -> in_progress -> completed
- Cancel pickup option
- Field Form integration from scheduled pickups

### 9. Route Planning (`/employee/routing`)
- Create routes with driver/vehicle assignment
- Add pickup stops to routes
- **Google Maps Integration**: Live route visualization with markers, directions, and distance/time calculation
- Route stops timeline (Yard -> Stops -> Return)

### 10. iPad Field Form (`/employee/field-form`)
- 4-step touch-optimized workflow
- Step 1: Tire cage photo capture (camera or gallery)
- Step 2: Store name, employee name, tire count
- Step 3: Digital signature pad (touch-enabled)
- Step 4: Review & submit (auto-creates scale ticket)
- Pre-fills data when linked from pickup management

## API Endpoints

### Auth
- `POST /api/auth/login` -- Login (customer or employee)
- `POST /api/auth/logout` -- Logout
- `GET /api/auth/verify` -- Verify session

### Employee Dashboard
- `GET /api/employee/dashboard` -- Dashboard stats + recent data

### Customer Management
- `GET /api/employee/customers` -- Active customers (for dropdowns)
- `GET /api/employee/customers/all?status=active|inactive` -- Full customer list with pending_pickups count
- `POST /api/employee/customers` -- Create new customer account
- `PUT /api/employee/customers/:id` -- Update customer
- `POST /api/employee/customers/:id/toggle` -- Activate/deactivate

### Staff Management
- `GET /api/employee/staff?role=driver|admin|manager|yard_operator` -- List employees
- `POST /api/employee/staff` -- Create new employee
- `PUT /api/employee/staff/:id` -- Update employee
- `POST /api/employee/staff/:id/toggle` -- Activate/deactivate

### Vehicle Management
- `GET /api/employee/vehicles?all=true` -- List vehicles (all=true includes inactive)
- `POST /api/employee/vehicles` -- Create new vehicle
- `PUT /api/employee/vehicles/:id` -- Update vehicle
- `POST /api/employee/vehicles/:id/toggle` -- Activate/deactivate

### Driver List
- `GET /api/employee/drivers` -- Active drivers for route/pickup assignment

### Scale Tickets
- `GET /api/scale-tickets?status=x,y,z&date=YYYY-MM-DD` -- List (multi-status filter support)
- `GET /api/scale-tickets/:id` -- Detail
- `POST /api/scale-tickets` -- Create ticket
- `POST /api/scale-tickets/field` -- Create from iPad field form
- `POST /api/scale-tickets/:id/weight` -- Record weight (in/out)
- `POST /api/scale-tickets/:id/finalize` -- Save pricing
- `POST /api/scale-tickets/:id/payment` -- Update payment status
- `POST /api/scale-tickets/:id/void` -- Void ticket

### Customer Pickups
- `GET /api/customer/pickups` -- Customer's own pickup requests
- `POST /api/customer/pickups` -- Submit new pickup request
- `GET /api/customer/pickups/:id` -- Single pickup detail

### Employee Pickups
- `GET /api/pickups?status=x&date=YYYY-MM-DD` -- List pickup requests (multi-status)
- `GET /api/pickups/:id` -- Single pickup detail
- `POST /api/pickups/:id/status` -- Update pickup status
- `POST /api/pickups/:id/assign` -- Assign driver and schedule

### Routes
- `GET /api/routes?date=x&employee_id=y` -- List routes
- `GET /api/routes/:id` -- Route with stops
- `POST /api/routes` -- Create route with stops
- `POST /api/routes/:id/status` -- Update route status
- `POST /api/routes/:routeId/stops/:stopId/status` -- Update stop status

### Square Payments
- `POST /api/square/terminal-checkout` -- Send to Square Reader
- `GET /api/square/terminal-checkout/:id` -- Check payment status
- `POST /api/square/terminal-checkout/:id/cancel` -- Cancel checkout
- `POST /api/square/payment` -- Direct payment
- `GET /api/square/devices` -- List Square terminals
- `POST /api/square/cash-payment` -- Record cash payment

### Pricing
- `GET /api/pricing` -- Get all pricing rates
- `POST /api/pricing/:id` -- Update pricing

### Config
- `GET /api/config/maps-key` -- Google Maps API key (for frontend)

## Data Architecture

### Database: Cloudflare D1 (SQLite)
- **customers** -- Company info, contacts, addresses, coordinates, login credentials
- **employees** -- Staff with roles (admin, manager, driver, yard_operator)
- **sessions** -- Auth tokens with expiry (auto-cleaned on login)
- **pickup_requests** -- Tire pickup requests with lifecycle status
- **routes** -- Route plans with driver/vehicle assignment
- **route_stops** -- Individual stops within routes
- **scale_tickets** -- Core ticket with field data, weights, pricing, payments
- **vehicles** -- Fleet with plate numbers, types, tare weights
- **pricing** -- Material-type pricing table (per-kg and per-tire rates)
- **payment_log** -- Payment audit trail

### Pricing Table (Default Rates)
| Material | Price/kg | Price/tire |
|----------|----------|------------|
| Passenger Tires | $0.15 | $4.00 |
| Truck Tires | $0.12 | $15.00 |
| Mixed Tires | $0.14 | $5.00 |
| Off-Road Tires | $0.10 | $25.00 |
| Shingles | $0.08 | -- |
| Scrap Metal | $0.45 | -- |

## Hardware Integration

### Accuren Apex Indicator (Bluetooth)
- Connects via Web Bluetooth API in Chrome/Edge
- Scans for BLE weight scale services
- Reads live weight data from the indicator
- Displays stable/unstable indicator

### Square Terminal Reader
- Sends payment amounts via Square Terminal API
- Polls for card tap/insert completion
- Records payment IDs and status in our database

### Receipt Printer
- Uses browser's native print dialog
- Formatted for 80mm thermal receipt paper
- Prints full scale ticket with weights, pricing, company info

## Environment Variables (.dev.vars)
```
GOOGLE_MAPS_API_KEY=<configured>
SQUARE_APP_ID=<configured>
SQUARE_ACCESS_TOKEN=<configured>
```

## Deployment
- **Platform**: Cloudflare Pages (Workers + D1)
- **GitHub**: https://github.com/ethan8585g/Reuse-Canada-CRM-v3
- **Status**: Running in sandbox
- **Last Updated**: 2026-03-23

## Recent Changes (v2.3)
- Customer Onboarding Module with full CRUD
- Driver & Staff Management with role-based cards
- Vehicle Management (create, edit, toggle active/inactive)
- Dashboard stat cards are now clickable (link to respective pages)
- Quick Actions include Onboard Customer and Add Driver
- Fixed: scale-tickets multi-status filter (was breaking Scale House ticket queue)
- Fixed: field form Axios CDN safety check and 401 interceptor
- Fixed: auth.ts consolidated duplicate queries, added session cleanup
- Fixed: customer management pending pickups stat uses live DB data
- Added vehicle CRUD APIs
