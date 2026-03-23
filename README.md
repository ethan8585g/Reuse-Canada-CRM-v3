# Reuse Canada — CRM & Operations Platform

## Project Overview
- **Name**: Reuse Canada CRM
- **Goal**: Unified platform for managing tire pickup logistics, digital scale ticketing, customer relationships, and route planning
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare Workers (D1 SQLite)

## Live URL
- **Sandbox**: https://3000-i7wpnsz9uva6yhriboyev-82b888ba.sandbox.novita.ai

## Login Credentials

### Customer Portal
| Username | Password | Company |
|----------|----------|---------|
| KALTIRE | TIRES! | Kal Tire - Edmonton South |

### Employee Portal
| Email | Password | Role |
|-------|----------|------|
| Ethan@reuse-canada.ca | Tires123! | Admin |
| admin@reusecanada.ca | admin123 | Admin |
| mike@reusecanada.ca | driver123 | Driver |
| sarah@reusecanada.ca | driver123 | Driver |
| james@reusecanada.ca | yard123 | Yard Operator |

## Completed Features

### 1. Dual Login System (`/`)
- Customer Portal (green) — username-based login
- Employee Portal (dark gray) — email-based login
- Session management with token auth
- Auto-redirect if already logged in

### 2. Scale House (`/employee/scale-house`) ⭐ NEW
Full-featured scale house ticketing station:
- **Bluetooth Accuren Apex Integration**: Web Bluetooth API connects to the Apex indicator via BLE. Live weight display with STABLE indicator. Supports auto-detect of BLE services.
- **3-Step Workflow**: Create Ticket → Capture Weight In (Gross) → Capture Weight Out (Tare) → Auto-calculate Net Weight
- **Auto Pricing**: Pulls rates from pricing table by material type. Calculates subtotal + 5% GST automatically.
- **Square Terminal Payment**: Sends $ amount to Square Reader for card tap/insert. Polls for payment completion. Cash payment option available.
- **Receipt Printing**: 80mm thermal receipt layout. Full ticket details with REUSE CANADA branding. Uses browser print dialog for any attached printer.
- **Ticket Queue**: Shows all active/pending tickets in sidebar. Click to load and continue working on any ticket.
- **Simulation Mode**: "Sim" button for testing without physical scale hardware.

### 3. Scale Ticket History (`/employee/scale-tickets`)
- Full ticket list with search/filter by status and date
- Ticket detail modal with all field data and weight history
- Weigh-in and weigh-out actions from the table
- Void ticket functionality

### 4. Customer Dashboard (`/customer/dashboard`)
- Submit tire pickup requests (count, type, date, notes)
- View request status and history
- Company profile display

### 5. Employee Dashboard (`/employee/dashboard`)
- Live stats: Pending Pickups, Today's Routes, Open Tickets, Completed Today
- Recent pickup requests and scale tickets
- Quick action cards linking to all modules

### 6. Pickup Management (`/employee/pickups`)
- Pickup request cards with full details
- Driver assignment and scheduling
- Status lifecycle: pending → confirmed → scheduled → in_progress → completed

### 7. Route Planning (`/employee/routing`)
- Create routes with driver/vehicle assignment
- Add pickup stops to routes
- **Google Maps Integration**: Live route visualization with markers, directions, and distance/time calculation
- Route stops timeline (Yard → Stops → Return)

### 8. iPad Field Form (`/employee/field-form`)
- 4-step touch-optimized workflow
- Step 1: Tire cage photo capture
- Step 2: Store name, employee name, tire count
- Step 3: Digital signature pad
- Step 4: Review & submit (auto-creates scale ticket)

## API Endpoints

### Auth
- `POST /api/auth/login` — Login (customer or employee)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/verify` — Verify session

### Scale Tickets
- `GET /api/scale-tickets` — List (filterable by status, date)
- `GET /api/scale-tickets/:id` — Detail
- `POST /api/scale-tickets` — Create ticket
- `POST /api/scale-tickets/field` — Create from iPad field form
- `POST /api/scale-tickets/:id/weight` — Record weight (in/out)
- `POST /api/scale-tickets/:id/finalize` — Save pricing
- `POST /api/scale-tickets/:id/payment` — Update payment status
- `POST /api/scale-tickets/:id/void` — Void ticket

### Square Payments
- `POST /api/square/terminal-checkout` — Send to Square Reader
- `GET /api/square/terminal-checkout/:id` — Check payment status
- `POST /api/square/terminal-checkout/:id/cancel` — Cancel checkout
- `POST /api/square/payment` — Direct payment
- `GET /api/square/devices` — List Square terminals
- `POST /api/square/cash-payment` — Record cash payment

### Pricing
- `GET /api/pricing` — Get all pricing rates
- `POST /api/pricing/:id` — Update pricing

### Pickups & Routes
- `GET /api/pickups` — List pickup requests
- `POST /api/pickups` — Create pickup request
- `GET /api/routes` — List routes
- `POST /api/routes` — Create route

## Data Architecture

### Database: Cloudflare D1 (SQLite)
- **customers** — Company info, contacts, addresses, coordinates
- **employees** — Staff with roles (admin, driver, yard_operator)
- **sessions** — Auth tokens with expiry
- **pickup_requests** — Tire pickup requests with lifecycle status
- **routes** — Route plans with driver/vehicle assignment
- **route_stops** — Individual stops within routes
- **scale_tickets** — Core ticket with field data, weights, pricing, payments
- **vehicles** — Fleet with tare weights
- **pricing** — Material-type pricing table (per-kg rates)
- **payment_log** — Payment audit trail

### Pricing Table (Default Rates)
| Material | Price/kg | Price/tire |
|----------|----------|------------|
| Passenger Tires | $0.15 | $4.00 |
| Truck Tires | $0.12 | $15.00 |
| Mixed Tires | $0.14 | $5.00 |
| Off-Road Tires | $0.10 | $25.00 |
| Shingles | $0.08 | — |
| Scrap Metal | $0.45 | — |

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
- **Status**: ✅ Running in sandbox
- **Last Updated**: 2026-03-23
