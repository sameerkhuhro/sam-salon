# SalonHub — Premium Unisex Salon Management System

> **Academic Context:** Developed for **SW417 Web Engineering PBL Assignment**, Mehran University of Engineering and Technology (MUET), SZAB Campus, Khairpur Mir's, Sindh, Pakistan.

---

## 1. Overview

**SalonHub** is a premium unisex salon platform catering to both men and women in Khairpur Mir's. The project features:
1. **Public-Facing Website:** Editorial landing page, service discovery with unisex categorization, master specialist portfolio, brand story, contact inquiries, and interactive 5-step appointment booking.
2. **Salon Owner Admin Portal:** Professional management dashboard, live appointment queue, specialist roster and shifts, service menu & pricing, client directory & visit logs, payment auditing, operating schedule, and performance reports.

---

## 2. Tech Stack & Architecture

- **Frontend:** React 18, Vite, React Router v6
- **Styling & Design System:** Tailwind CSS v3, custom brand tokens (Charcoal `#24211F`, Warm Ivory `#F4EEE5`, Champagne Gold `#C7A66A`, Taupe `#B7AAA0`)
- **Typography:** Cormorant Garamond (Serif), Playfair Display (Italic Display), Plus Jakarta Sans (Body)
- **Icons:** Lucide React
- **Data & Service Layer:** Structured mock data layer and localStorage synchronization (`src/admin/services/adminService.js`) prepared for seamless 1:1 migration to Express and MongoDB Atlas in Phase 2.

---

## 3. Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation & Development
```bash
# Navigate to the project directory
cd salonhub

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

The application will run at:
- **Public Website:** `http://localhost:5173/`
- **Admin Portal Sign In:** `http://localhost:5173/admin/login`

### Production Build
```bash
npm run build
```
The compiled output is saved to the `dist/` directory.

---

## 4. Admin Portal Access & Credentials

For the UI-First phase, the application includes development authentication with session persistence:

- **Login URL:** `/admin/login`
- **Demo Admin Email:** `admin@salonhub.pk`
- **Demo Password:** `admin` (or any password $\ge$ 4 characters)

---

## 5. Application Routing

### Public Routes
| Route | Component | Purpose |
|---|---|---|
| `/` | `Home` | Editorial hero, service strip, about showcase, stats, and testimonials |
| `/services` | `Services` | Full unisex catalog, category visual cards, gender tabs, price in PKR |
| `/team` | `Team` | Master specialist portraits, bios, experience, and direct booking |
| `/book` | `Book` | 5-step appointment flow (Service, Stylist, Date/Time, Details, Review) |
| `/booking/confirmation/:ref` | `Confirmation` | Instant reservation receipt with reference code |
| `/about` | `About` | Brand heritage, philosophy, and craft standards |
| `/contact` | `Contact` | Khairpur Mir's salon address, hours, WhatsApp, and inquiry form |

### Admin Portal Routes (Protected)
| Route | Page | Purpose |
|---|---|---|
| `/admin/login` | `AdminLogin` | Admin credentials verification and session initiation |
| `/admin` & `/admin/dashboard` | `AdminDashboard` | KPIs, 7-day revenue trend chart, recent arrivals, popular services |
| `/admin/appointments` | `AdminAppointments` | Reservation listing, filters, status transitions, rescheduling, walk-in creation |
| `/admin/staff` | `AdminStaff` | Specialist directory, add/edit modal, activation toggle, shift schedule |
| `/admin/services` | `AdminServices` | Menu catalog, categories, pricing, duration, audience tags, status toggle |
| `/admin/customers` | `AdminCustomers` | Client directory, appointment history drawer, lifetime spending |
| `/admin/payments` | `AdminPayments` | Revenue summary, transaction log, tender methods, manual receipt recording |
| `/admin/schedule` | `AdminSchedule` | Salon opening hours by day, Friday prayer hours, staff leaves |
| `/admin/reports` | `AdminReports` | Performance analytics, completion rates, monthly revenue progression |
| `/admin/settings` | `AdminSettings` | Business profile, buffer intervals, advance booking rules, regional defaults |

---

## 6. Phase 2 Backend Integration Roadmap

In Phase 2, the current `src/admin/services/adminService.js` and `src/lib/api.js` abstractions will connect to an Express server with MongoDB Atlas:

1. **Authentication API:** `POST /api/auth/login` returning an HttpOnly JWT cookie and role authorization middleware.
2. **Appointments API:** `GET /api/appointments`, `POST /api/appointments`, `PATCH /api/appointments/:id/status`, `PATCH /api/appointments/:id/reschedule`.
3. **Staff API:** `GET /api/staff`, `POST /api/staff`, `PUT /api/staff/:id`, `PATCH /api/staff/:id/status`.
4. **Services API:** `GET /api/services`, `POST /api/services`, `PUT /api/services/:id`.
5. **Customers API:** `GET /api/customers`, `GET /api/customers/:id/history`.
6. **Payments API:** `GET /api/payments`, `POST /api/payments`.
7. **Schedule API:** `GET /api/schedule`, `PUT /api/schedule/hours`, `POST /api/schedule/leaves`.
8. **Settings API:** `GET /api/settings`, `PUT /api/settings`.
