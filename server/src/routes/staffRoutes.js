import { Router } from 'express'
import {
  getStaff,
  getFeaturedStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  toggleStaffFeatured,
  addStaffLeave,
  removeStaffLeave,
  deleteStaff,
} from '../controllers/staffController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Public read access for customers
router.get('/', getStaff)
router.get('/featured', getFeaturedStaff)
router.get('/:id', getStaffById)

// Protected admin mutations
router.post('/', protect, createStaff)
router.put('/:id', protect, updateStaff)
router.put('/:id/status', protect, toggleStaffStatus)
router.put('/:id/featured', protect, toggleStaffFeatured)
router.post('/:id/leaves', protect, addStaffLeave)
router.delete('/:id/leaves/:leaveId', protect, removeStaffLeave)
router.delete('/:id', protect, deleteStaff)

export default router
