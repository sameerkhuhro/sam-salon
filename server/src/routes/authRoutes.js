import { Router } from 'express'
import {
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)

export default router
