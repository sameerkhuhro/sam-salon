import { Router } from 'express'
import {
  getServices,
  getFeaturedServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceFeatured,
  toggleServiceStatus,
  deleteService,
} from '../controllers/serviceController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Public read access for customers
router.get('/', getServices)
router.get('/featured', getFeaturedServices)
router.get('/:id', getServiceById)

// Protected admin mutations
router.post('/', protect, createService)
router.put('/:id/featured', protect, toggleServiceFeatured)
router.put('/:id/status', protect, toggleServiceStatus)
router.put('/:id', protect, updateService)
router.delete('/:id', protect, deleteService)

export default router

