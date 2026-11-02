import { Router } from 'express'
import {
  getPayments,
  createPayment,
  updatePaymentStatus,
  processRefund,
} from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/')
  .get(getPayments)
  .post(createPayment)

router.put('/:id/status', updatePaymentStatus)
router.post('/:id/refund', processRefund)

export default router

