import { Router } from 'express'
import {
  getAppointments,
  getAppointmentById,
  getAppointmentByRef,
  createAppointment,
  updateAppointmentStatus,
  recordAppointmentPayment,
  rescheduleAppointment,
  getAvailability,
} from '../controllers/appointmentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Public endpoints for customer booking flow
router.post('/', createAppointment)
router.get('/ref/:ref', getAppointmentByRef)
router.get('/availability', getAvailability)

// Protected admin endpoints
router.get('/', protect, getAppointments)
router.get('/:id', protect, getAppointmentById)
router.put('/:id/status', protect, updateAppointmentStatus)
router.post('/:id/pay', protect, recordAppointmentPayment)
router.put('/:id/reschedule', protect, rescheduleAppointment)

export default router

