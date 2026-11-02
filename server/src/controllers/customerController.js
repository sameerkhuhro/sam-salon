import { Customer } from '../models/Customer.js'
import { Appointment } from '../models/Appointment.js'

// GET /api/customers
export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query
    const filter = {}

    if (search) {
      const q = search.trim()
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
    }

    const customers = await Customer.find(filter).sort({ totalSpent: -1, updatedAt: -1 })
    res.json({
      success: true,
      count: customers.length,
      customers,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers',
      error: error.message,
    })
  }
}

// GET /api/customers/:id
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' })
    }

    const appointments = await Appointment.find({
      $or: [{ customerId: customer._id }, { customerPhone: customer.phone }],
    }).sort({ date: -1 })

    res.json({
      success: true,
      customer,
      appointments,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer history',
      error: error.message,
    })
  }
}

// POST /api/customers
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.',
      })
    }

    const existing = await Customer.findOne({ phone: phone.trim() })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this phone number already exists.',
      })
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      notes: notes || '',
    })

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message,
    })
  }
}

// PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, notes } = req.body
    const customer = await Customer.findById(req.params.id)

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' })
    }

    if (name) customer.name = name.trim()
    if (email !== undefined) customer.email = email.trim()
    if (notes !== undefined) customer.notes = notes

    await customer.save()

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message,
    })
  }
}

