import { Router } from 'express'
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '../controllers/customerController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/')
  .get(getCustomers)
  .post(createCustomer)

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)

export default router

