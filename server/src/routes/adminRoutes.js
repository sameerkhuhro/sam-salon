import { Router } from 'express'
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
  resetAdminPassword,
  deleteAdmin,
} from '../controllers/adminController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// All admin management routes require an authenticated active admin session
router.use(protect)

router.route('/')
  .get(getAdmins)
  .post(createAdmin)

router.route('/:id')
  .put(updateAdmin)
  .delete(deleteAdmin)

router.put('/:id/status', toggleAdminStatus)
router.put('/:id/password', resetAdminPassword)

export default router

