import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settingController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Public read access for salon contact info & opening hours
router.get('/', getSettings)

// Protected admin update
router.put('/', protect, updateSettings)

export default router

