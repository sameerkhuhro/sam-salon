import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import { seedDatabase } from './seed/seedData.js'

import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import staffRoutes from './routes/staffRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import settingRoutes from './routes/settingRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

import { notFound, errorHandler } from './middleware/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Configure CORS
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`))
      }
    },
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static file hosting for uploaded assets fallback
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SalonHub Backend API',
    database: 'MongoDB Atlas',
  })
})

// Mount API Routes
app.use('/api/auth', authRoutes)
app.use('/api/admins', adminRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Centralized error handling
app.use(notFound)
app.use(errorHandler)

// Initialize Database & Start Server
const startServer = async () => {
  try {
    await connectDB()

    // Automatically check and seed initial setup if required
    await seedDatabase().catch((err) => {
      console.warn('[Server Warning] Auto-seed error (non-fatal):', err.message)
    })

    app.listen(PORT, () => {
      console.log(`=================================================`)
      console.log(`  SalonHub API Server running on port ${PORT}`)
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`  Health Check: http://localhost:${PORT}/api/health`)
      console.log(`=================================================`)
    })
  } catch (error) {
    console.error('[Server Error] Critical startup failure:', error.message)
    process.exit(1)
  }
}

startServer()

