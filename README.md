# SalonHub — Full-Stack Unisex Salon Management Platform

SalonHub is a modern, full-stack salon management platform designed for luxury unisex salons. It includes a photographic editorial public booking website, a dedicated administrative dashboard, and a robust Node.js/Express REST backend backed by MongoDB Atlas.

---

## 1. Project Architecture

```text
salonhub-web/
├── server/                    # Node.js + Express + Mongoose + JWT Backend (Port 5000)
│   ├── src/
│   │   ├── config/            # MongoDB Atlas connection & resilient failover
│   │   ├── controllers/       # Auth, Admins, Services, Staff, Appointments, etc.
│   │   ├── middleware/        # JWT Authentication (`protect`) & central error handler
│   │   ├── models/            # Mongoose Schemas (Admin, Service, Staff, Customer, etc.)
│   │   ├── routes/            # REST API Routes (/api/*)
│   │   ├── seed/              # Database seeder (auto-creates initial Admin & Catalog)
│   │   └── server.js          # Express app entry point
│   ├── .env                   # Server environment configuration
│   └── package.json
│
├── admin/                     # Standalone React + Vite Admin Portal (Port 5174)
│   ├── src/
│   │   ├── components/        # Layout (Sidebar, Header), Modals, StatCards, Badges
│   │   ├── context/           # AdminAuthContext (JWT session persistence)
│   │   ├── pages/             # Dashboard, Appointments, Staff, Services, Admins, etc.
│   │   └── services/          # Real API client communicating with backend
│   └── package.json
│
└── salonhub/                  # Public Customer Website & Online Booking (Port 5173)
    ├── src/
    │   ├── components/        # Editorial UI components, Header, Footer
    │   ├── pages/             # Home, Services, Team, Book, Confirmation, About, Contact
    │   └── lib/               # api.js connecting booking & availability to backend
    └── package.json
```

---

## 2. MongoDB Atlas Database Setup

### Step A: Get Your MongoDB Atlas Connection URI
1. Sign in to your [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
2. Under **Database**, select **Connect** on your cluster.
3. Choose **Drivers** (Node.js).
4. Copy your connection string, which looks like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/salonhub?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials.

### Step B: Configure Environment Variables
Open `server/.env` and paste your MongoDB Atlas connection string:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxx.mongodb.net/salonhub?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=salonhub_jwt_super_secret_key_khairpur_mirs_2026
JWT_EXPIRES_IN=7d

# Initial Setup Admin Credentials
INITIAL_ADMIN_NAME=Salon Owner
INITIAL_ADMIN_EMAIL=admin@salonhub.pk
INITIAL_ADMIN_PASSWORD=SalonHub@2026!
INITIAL_ADMIN_PHONE=+92 300 1234567

# CORS Allowed Origins
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5174
```

> **Note:** If `MONGODB_URI` is not provided or Atlas is temporarily unreachable, the backend gracefully falls back to your local MongoDB service at `mongodb://127.0.0.1:27017/salonhub`.

---

## 3. Initial Admin Setup & Database Seeding

The backend automatically creates the initial administrative account and luxury unisex service catalog when it first starts up. You can also trigger the database seed manually:

```bash
cd server
npm run seed
```

### Initial Admin Credentials
- **Email:** `admin@salonhub.pk`
- **Password:** `SalonHub@2026!`
- **Role:** `admin` (Full salon operational & management authority)

Passwords are encrypted using **bcrypt** (10 salt rounds) and password hashes are never exposed in API responses (`select: false`).

---

## 4. Admin Account Management

The dashboard includes a dedicated **Admin Accounts** section (`/admin/admins`) accessible via the sidebar:

- **Create New Admin:** Add administrators with full name, unique email, contact phone, and secure password (minimum 6 characters).
- **Edit Profile:** Update administrator names, phone numbers, and operational roles.
- **Deactivate / Activate:** Toggle active statuses. Built-in protection prevents deactivating your own active session to prevent administrative lockout.
- **Reset Passwords:** Secure modal allowing immediate password resets hashed with bcrypt on the server.
- **Delete Protection:** Protection prevents deleting your own account or deleting the last active salon administrator.

---

## 5. Staff & Services Specialization Architecture

- **Single Source of Truth:** Staff profiles reference service IDs (`serviceIds` and `specialtyServiceIds`). Service names and prices are never duplicated into staff records.
- **Specialty Constraint Enforcement:** A service **cannot** be marked as a specialty unless it is assigned to that staff member. If a service is removed, its specialty designation is automatically revoked.
- **Dynamic Updates:** When a service name or price is modified in Services Management, it automatically updates across all staff cards, profiles, and booking options.
- **Safe Archival:** Deactivating a service preserves historical appointment and payment records without silently destroying data.

---

### Media Uploads & Cloudinary Integration
Images (Specialist avatars, Service photography, Salon emblems, and Banners) are uploaded via Cloudinary v2 stream upload.
- **Configured via `.env`:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Automatic Local Fallback:** If Cloudinary credentials are unset or placeholder, files are safely uploaded to `server/public/uploads` and statically served via `/uploads/*` without throwing runtime crashes.

---

## 6. REST API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticates admin, sets secure HttpOnly cookie & returns JWT |
| POST | `/api/auth/logout`| Public | Clears administrative session cookie |
| GET | `/api/auth/me` | Protected | Returns current authenticated admin profile |
| PUT | `/api/auth/profile` | Protected | Updates name, phone, or avatar |
| PUT | `/api/auth/change-password` | Protected | Updates administrator password |

### Service Categories (`/api/categories`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | List categories with slug, icon, and treatment associations |
| GET | `/api/categories/:id` | Public | Get category details |
| POST | `/api/categories` | Protected | Create category |
| PUT | `/api/categories/:id` | Protected | Update category |
| DELETE | `/api/categories/:id` | Protected | Delete category (checks for active services first) |

### Asset Uploads (`/api/upload`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| POST | `/api/upload/image` | Protected | Multi-part image upload to Cloudinary with local storage fallback |
| DELETE | `/api/upload/image` | Protected | Cleans up asset from Cloudinary storage |

### Admin Management (`/api/admins`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/api/admins` | Protected | Lists all salon administrator accounts |
| POST | `/api/admins` | Protected | Creates a new admin account |
| PUT | `/api/admins/:id` | Protected | Updates admin details |
| PUT | `/api/admins/:id/status` | Protected | Toggles active/inactive status |
| PUT | `/api/admins/:id/password` | Protected | Resets administrator password |
| DELETE | `/api/admins/:id` | Protected | Deletes an admin account |

### Services (`/api/services`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/api/services` | Public | List treatments (filter by category, gender, status) |
| POST | `/api/services` | Protected | Create treatment in catalog |
| PUT | `/api/services/:id` | Protected | Edit treatment details |
| PUT | `/api/services/:id/status` | Protected | Toggle active/inactive catalog status |
| DELETE | `/api/services/:id` | Protected | Remove treatment |

### Staff Directory & Leaves (`/api/staff`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/api/staff` | Public | List specialists (filter by service, specialty, status) |
| POST | `/api/staff` | Protected | Add new specialist with service assignments |
| PUT | `/api/staff/:id` | Protected | Update specialist profile, shifts, and specialties |
| PUT | `/api/staff/:id/status` | Protected | Toggle active booking availability |
| POST | `/api/staff/:id/leaves` | Protected | Schedule staff leave (blocks booking availability) |
| DELETE | `/api/staff/:id/leaves/:leaveId` | Protected | Remove scheduled staff leave |
| DELETE | `/api/staff/:id` | Protected | Remove specialist |

### Appointments & Booking (`/api/appointments`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| POST | `/api/appointments` | Public / Admin | Create reservation with overlap & double-booking prevention |
| GET | `/api/appointments` | Protected | List appointments with filters (date, staff, status) |
| GET | `/api/appointments/ref/:ref` | Public | Lookup reservation for confirmation page |
| GET | `/api/appointments/availability` | Public | Calculate live available calendar slots (shifts, breaks, leaves) |
| PUT | `/api/appointments/:id/status` | Protected | Update status (`confirmed`, `completed`, `cancelled`) |
| PUT | `/api/appointments/:id/reschedule`| Protected | Reschedule appointment date and time |

### Customers, Payments, Settings & Analytics
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/api/customers` | Protected | Directory of salon clients with visit & spend stats |
| GET | `/api/payments` | Protected | Audit register receipts and filter by payment method |
| POST | `/api/payments` | Protected | Record cash/card payment and mark appointment paid |
| POST | `/api/payments/:id/refund` | Protected | Issue partial or full refund with audit notes |
| GET | `/api/settings` | Public | Salon address, contact details, opening hours, logo, banner |
| PUT | `/api/settings` | Protected | Update salon settings & opening schedule |
| GET | `/api/dashboard` | Protected | Aggregated revenue (verified payments minus refunds), 7-day trend |

---

## 7. Automated Testing & Verification Suite

A 20-point end-to-end integration test is included in `scratch/verify_all.js`. It tests every critical path:
- Database connectivity & Auto-seeding
- Admin Authentication (JWT + HttpOnly Cookie)
- Category & Treatment catalogs
- Staff specialists & service assignment / specialty constraints
- Availability slot calculation factoring in opening hours, shift hours, meal breaks, and leaves
- Double-booking prevention (verifies that a conflicting reservation returns HTTP 409)
- Staff leave scheduling & automated slot blocking
- Cash register receipt generation & refund calculation
- Dashboard KPI calculation strictly derived from actual recorded payments

Run the test suite:
```bash
node scratch/verify_all.js
# Output: TEST RESULTS: 20 Passed, 0 Failed
```

---

## 7. How to Run the Applications

Open 3 terminal windows to run the complete stack concurrently:

### Terminal 1 — Backend API Server
```bash
cd server
npm start
# API listening at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Terminal 2 — Admin Portal
```bash
cd admin
npm run dev
# Dashboard running at http://localhost:5174
```

### Terminal 3 — Public Website
```bash
cd salonhub
npm run dev
# Public salon website running at http://localhost:5173
```

