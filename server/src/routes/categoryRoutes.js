import { Router } from 'express'
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Public read access for customer booking and service browsing
router.get('/', getCategories)
router.get('/:id', getCategoryById)

// Protected administrative actions
router.post('/', protect, createCategory)
router.put('/:id', protect, updateCategory)
router.delete('/:id', protect, deleteCategory)

export default router
