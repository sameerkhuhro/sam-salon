import { Router } from 'express'
import { getDashboardMetrics } from '../controllers/dashboardController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/', protect, getDashboardMetrics)

export default router

