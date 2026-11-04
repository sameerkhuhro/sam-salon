import { Appointment } from '../models/Appointment.js'
import { Customer } from '../models/Customer.js'
import { Staff } from '../models/Staff.js'
import { Service } from '../models/Service.js'
import { Setting } from '../models/Setting.js'
import { Payment } from '../models/Payment.js'

// Helper: generate unique salon booking reference
const generateRef = () => {
  const datePart = new Date().toISOString().slice(2, 7).replace('-', '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `SH-${datePart}-${random}`
}

// Helper: Convert time string ("10:00 am", "02:30 pm", "14:30") to minutes from midnight
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const clean = timeStr.trim().toLowerCase()
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3]
  if (meridiem === 'pm' && hours < 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0
  return hours * 60 + minutes
}

// Helper: Convert minutes from midnight back to display label ("10:00 am", "02:30 pm")
export const minutesToTimeLabel = (totalMinutes) => {
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const meridiem = hours24 >= 12 ? 'pm' : 'am'
  let hours12 = hours24 % 12
  if (hours12 === 0) hours12 = 12
  const formattedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
  return `${formattedHours}:${formattedMinutes} ${meridiem}`
}

// Helper: Get weekday name from ISO date string YYYY-MM-DD
export const getDayName = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[d.getUTCDay()]
}

/**
 * Validate scheduling constraints for an appointment:
 * - Salon open status & hours
 * - Staff active status, working day, shift hours, break time, and leave
 * - Service duration & qualification
 * - Overlap with existing booked appointments
 */
export const validateAppointmentBooking = async ({
  staffId,
  serviceId,
  serviceIds = [],
  date,
  time,
  durationMin,
  excludeAppointmentId = null,
}) => {
  const dayName = getDayName(date)
  const startMin = timeToMinutes(time)
  const duration = Number(durationMin) || 45
  const endMin = startMin + duration

  // 1. Fetch Salon Settings
  let settings = await Setting.findOne()
  if (!settings) {
    settings = {
      openingHours: [
        { day: 'Monday', open: '10:00', close: '20:00', closed: false },
        { day: 'Tuesday', open: '10:00', close: '20:00', closed: false },
        { day: 'Wednesday', open: '10:00', close: '20:00', closed: false },
        { day: 'Thursday', open: '10:00', close: '20:00', closed: false },
        { day: 'Friday', open: '14:00', close: '21:00', closed: false },
        { day: 'Saturday', open: '10:00', close: '21:00', closed: false },
        { day: 'Sunday', open: '11:00', close: '19:00', closed: false },
      ],
    }
  }

  const daySetting = settings.openingHours?.find((h) => h.day === dayName)
  if (daySetting) {
    if (daySetting.closed) {
      return { valid: false, error: `The salon is closed on ${dayName}s.` }
    }
    const salonOpen = timeToMinutes(daySetting.open || '10:00')
    const salonClose = timeToMinutes(daySetting.close || '20:00')

    if (startMin < salonOpen || endMin > salonClose) {
      return {
        valid: false,
        error: `Selected time (${time} - ${minutesToTimeLabel(endMin)}) is outside salon opening hours (${daySetting.open} - ${daySetting.close}) on ${dayName}.`,
      }
    }
  }

  // 2. Fetch Staff Member
  const cleanStaffId = typeof staffId === 'string' ? staffId.trim() : (staffId ? staffId.toString() : '')
  const staffMember = await Staff.findOne({
    $or: [
      { _id: /^[0-9a-fA-F]{24}$/.test(cleanStaffId) ? cleanStaffId : null },
      { legacyId: cleanStaffId },
      { id: cleanStaffId },
    ],
  })

  if (!staffMember) {
    return { valid: false, error: 'The selected specialist could not be found.' }
  }

  if (staffMember.status !== 'active') {
    return {
      valid: false,
      error: `${staffMember.name} is currently inactive and not available for client bookings.`,
    }
  }

  // 3. Verify Staff Service Qualification (supports single, multiple, legacyIds, or ObjectIds)
  let targetIds = []
  if (Array.isArray(serviceIds) && serviceIds.length > 0) {
    targetIds = serviceIds.filter(Boolean).map((s) => s.toString().trim())
  } else if (serviceId) {
    targetIds = serviceId.includes(',')
      ? serviceId.split(',').map((s) => s.trim()).filter(Boolean)
      : [serviceId.toString().trim()]
  }

  let isAssigned = true
  if (targetIds.length > 0 && staffMember.serviceIds && staffMember.serviceIds.length > 0) {
    const objectIdCandidates = targetIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id))
    const matchedServices = await Service.find({
      $or: [
        { _id: { $in: objectIdCandidates } },
        { legacyId: { $in: targetIds } },
        { id: { $in: targetIds } },
      ],
    })

    const staffServiceIdStrings = staffMember.serviceIds.map((s) => s.toString())

    isAssigned = targetIds.every((tId) => {
      // Direct string match against staff serviceIds
      if (staffServiceIdStrings.includes(tId)) return true

      // Match via resolved Service doc (either _id or legacyId)
      const svc = matchedServices.find(
        (s) => s._id.toString() === tId || s.legacyId === tId || s.id === tId
      )
      if (!svc) return true // If custom treatment not cataloged, do not block appointment
      return (
        staffServiceIdStrings.includes(svc._id.toString()) ||
        (svc.legacyId && staffServiceIdStrings.includes(svc.legacyId))
      )
    })
  }

  if (!isAssigned) {
    return {
      valid: false,
      error: `${staffMember.name} is not assigned to perform all selected treatments.`,
    }
  }

  // 4. Verify Staff Working Days
  const workingDays = staffMember.schedule?.days || [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  if (!workingDays.includes(dayName)) {
    return {
      valid: false,
      error: `${staffMember.name} is not scheduled to work on ${dayName}s.`,
    }
  }

  // 5. Verify Staff Shift Hours
  const shiftStartMin = timeToMinutes(staffMember.schedule?.shiftStart || '10:00')
  const shiftEndMin = timeToMinutes(staffMember.schedule?.shiftEnd || '19:00')

  if (startMin < shiftStartMin || endMin > shiftEndMin) {
    return {
      valid: false,
      error: `Selected time is outside ${staffMember.name}'s working shift (${staffMember.schedule?.shiftStart} - ${staffMember.schedule?.shiftEnd}).`,
    }
  }

  // 6. Verify Staff Break Time
  if (staffMember.schedule?.breakTime && staffMember.schedule.breakTime.includes('-')) {
    const [bStart, bEnd] = staffMember.schedule.breakTime.split('-').map((s) => s.trim())
    const breakStartMin = timeToMinutes(bStart)
    const breakEndMin = timeToMinutes(bEnd)

    if (startMin < breakEndMin && endMin > breakStartMin) {
      return {
        valid: false,
        error: `${staffMember.name} is scheduled for a meal/rest break from ${bStart} to ${bEnd}. Please choose another slot.`,
      }
    }
  }

  // 7. Verify Staff Leave
  const isOnLeave = staffMember.leaves?.some((l) => l.date === date)
  if (isOnLeave) {
    return {
      valid: false,
      error: `${staffMember.name} is on approved leave on ${date}. Please select another specialist.`,
    }
  }

  // 8. Overlapping Appointment Check (Prevent Double-Booking)
  const existingApptsQuery = {
    staffId: { $in: [staffMember._id.toString(), staffMember.legacyId, staffId] },
    date,
    status: { $in: ['pending', 'confirmed', 'completed'] },
  }

  if (excludeAppointmentId) {
    existingApptsQuery._id = { $ne: excludeAppointmentId }
  }

  const existingAppts = await Appointment.find(existingApptsQuery)

  for (const appt of existingAppts) {
    const apptStartMin = timeToMinutes(appt.time)
    const apptDuration = Number(appt.durationMin) || 45
    const apptEndMin = apptStartMin + apptDuration

    // Overlap condition: startA < endB && endA > startB
    if (startMin < apptEndMin && endMin > apptStartMin) {
      return {
        valid: false,
        error: `${staffMember.name} is already booked from ${appt.time} to ${minutesToTimeLabel(
          apptEndMin
        )} on this date. Double-booking is strictly prohibited.`,
      }
    }
  }

  return { valid: true, staff: staffMember }
}

// GET /api/appointments
export const getAppointments = async (req, res) => {
  try {
    const { status, staffId, date, search } = req.query
    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }
    if (staffId && staffId !== 'all') {
      const cleanStaffId = typeof staffId === 'string' ? staffId.trim() : (staffId ? staffId.toString() : '')
      const staffDoc = await Staff.findOne({
        $or: [
          { _id: /^[0-9a-fA-F]{24}$/.test(cleanStaffId) ? cleanStaffId : null },
          { legacyId: cleanStaffId },
          { id: cleanStaffId },
        ],
      })
      if (staffDoc) {
        filter.staffId = { $in: [staffDoc._id.toString(), staffDoc.legacyId, cleanStaffId].filter(Boolean) }
      } else {
        filter.staffId = cleanStaffId
      }
    }
    if (date) {
      filter.date = date
    }
    if (search) {
      const q = search.trim()
      filter.$or = [
        { ref: { $regex: q, $options: 'i' } },
        { customerName: { $regex: q, $options: 'i' } },
        { customerPhone: { $regex: q, $options: 'i' } },
        { serviceName: { $regex: q, $options: 'i' } },
        { staffName: { $regex: q, $options: 'i' } },
      ]
    }

    const appointments = await Appointment.find(filter).sort({ date: -1, time: 1 })
    res.json({
      success: true,
      count: appointments.length,
      appointments,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments',
      error: error.message,
    })
  }
}

// GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }
    res.json({ success: true, appointment })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve appointment', error: error.message })
  }
}

// GET /api/appointments/ref/:ref (Public confirmation lookup)
export const getAppointmentByRef = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ ref: req.params.ref.toUpperCase().trim() })
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' })
    }
    res.json({ success: true, appointment })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to find appointment', error: error.message })
  }
}

// POST /api/appointments (Used by public booking and admin walk-in)
export const createAppointment = async (req, res) => {
  try {
    const {
      serviceId,
      serviceIds,
      services: incomingServices,
      serviceName,
      price,
      durationMin,
      staffId,
      staffName,
      date,
      time,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      paymentMethod,
      paymentStatus,
    } = req.body

    if ((!serviceId && (!serviceIds || serviceIds.length === 0)) || !staffId || !date || !time || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Required booking parameters missing (service, specialist, date, time, customer details).',
      })
    }

    // Optional email validation: only validate format if a non-empty email is actually provided
    let cleanEmail = ''
    if (customerEmail && typeof customerEmail === 'string' && customerEmail.trim()) {
      cleanEmail = customerEmail.trim()
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address or leave it blank.',
        })
      }
    }

    // Process services and multi-service combinations
    let finalServiceId = serviceId || (Array.isArray(serviceIds) && serviceIds[0]) || ''
    let finalServiceIds = Array.isArray(serviceIds) && serviceIds.length > 0 ? serviceIds : (finalServiceId ? [finalServiceId] : [])
    let finalServiceName = serviceName
    let finalPrice = Number(price) || 0
    let finalDuration = Number(durationMin) || 45
    let finalServicesList = Array.isArray(incomingServices) ? incomingServices : []

    // If single service lookup is applicable
    if (finalServiceIds.length === 1 && !serviceName) {
      const singleIdStr = String(finalServiceId)
      const svc = await Service.findOne({
        $or: [
          { _id: /^[0-9a-fA-F]{24}$/.test(singleIdStr) ? singleIdStr : null },
          { legacyId: singleIdStr },
          { id: singleIdStr },
        ],
      })

      if (svc) {
        if (svc.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: `The treatment "${svc.name}" is currently inactive or archived.`,
          })
        }
        finalServiceName = svc.name
        finalPrice = svc.price
        finalDuration = svc.durationMin
        finalServicesList = [{
          id: svc.id || svc._id.toString(),
          name: svc.name,
          price: svc.price,
          durationMin: svc.durationMin,
          category: svc.category,
        }]
      }
    }

    // Validate Scheduling Constraints & Double-Booking
    const validation = await validateAppointmentBooking({
      staffId,
      serviceId: finalServiceId,
      serviceIds: finalServiceIds,
      date,
      time,
      durationMin: finalDuration,
    })

    if (!validation.valid) {
      return res.status(409).json({
        success: false,
        message: validation.error,
      })
    }

    const finalStaff = validation.staff
    const finalStaffName = finalStaff ? finalStaff.name : staffName || 'Specialist'

    // Upsert Customer profile (email is strictly optional)
    let customer = await Customer.findOne({ phone: customerPhone.trim() })
    if (customer) {
      customer.totalVisits += 1
      customer.totalSpent += Number(finalPrice || 0)
      customer.lastVisit = new Date()
      if (cleanEmail && !customer.email) customer.email = cleanEmail
      await customer.save()
    } else {
      customer = await Customer.create({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: cleanEmail || '',
        totalVisits: 1,
        totalSpent: Number(finalPrice || 0),
        lastVisit: new Date(),
      })
    }

    const ref = generateRef()
    const numericPrice = Number(finalPrice || 0)
    const initialPaymentStatus = paymentStatus || 'unpaid'
    const initialAmountPaid = initialPaymentStatus === 'paid' ? numericPrice : 0
    const initialOutstanding = Math.max(0, numericPrice - initialAmountPaid)

    const appointment = await Appointment.create({
      ref,
      customerId: customer._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: cleanEmail || '',
      serviceId: finalServiceId,
      serviceIds: finalServiceIds,
      services: finalServicesList,
      serviceName: finalServiceName || 'Salon Service',
      price: numericPrice,
      amountPaid: initialAmountPaid,
      outstandingAmount: initialOutstanding,
      durationMin: finalDuration,
      staffId: finalStaff?._id?.toString() || staffId,
      staffName: finalStaffName,
      date,
      time,
      status: 'pending',
      paymentStatus: initialPaymentStatus,
      paymentMethod: paymentMethod || 'Cash',
      notes: notes || '',
    })

    // If marked as paid on creation (e.g. walk-in upfront cash), create corresponding payment record
    if (initialPaymentStatus === 'paid' && numericPrice > 0) {
      await Payment.create({
        invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        appointmentId: appointment._id,
        appointmentRef: appointment.ref,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceName: finalServiceName || 'Salon Service',
        staffName: finalStaffName,
        totalAmount: numericPrice,
        amountPaid: numericPrice,
        outstandingAmount: 0,
        amount: numericPrice,
        method: paymentMethod || 'Cash',
        status: 'paid',
        date,
        notes: 'Initial booking payment',
      }).catch((e) => console.error('Payment sync error on creation:', e.message))
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      ref,
      appointment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message,
    })
  }
}

// PUT /api/appointments/:id/status
// MANDATORY RULE: Marking appointment as completed NEVER marks it as paid!
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    // Explicitly update only booking status lifecycle
    appointment.status = status
    await appointment.save()

    res.json({
      success: true,
      message: `Appointment marked as ${status}. Payment status remains ${appointment.paymentStatus}.`,
      appointment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    })
  }
}

// POST /api/appointments/:id/pay
// Dedicated payment recording endpoint with balance calculations and audit trail
export const recordAppointmentPayment = async (req, res) => {
  try {
    const { amount, method, notes } = req.body
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    const payAmount = Number(amount)
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment amount greater than PKR 0',
      })
    }

    const price = Number(appointment.price) || 0
    const currentPaid = Number(appointment.amountPaid) || 0
    const currentOutstanding = Math.max(0, price - currentPaid)

    if (payAmount > currentOutstanding) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (PKR ${payAmount.toLocaleString()}) cannot exceed remaining balance (PKR ${currentOutstanding.toLocaleString()}).`,
      })
    }

    const newAmountPaid = currentPaid + payAmount
    const newOutstanding = Math.max(0, price - newAmountPaid)
    const newPaymentStatus = newOutstanding === 0 ? 'paid' : 'partially_paid'

    // Update appointment
    appointment.amountPaid = newAmountPaid
    appointment.outstandingAmount = newOutstanding
    appointment.paymentStatus = newPaymentStatus
    if (method) appointment.paymentMethod = method
    if (notes) {
      appointment.notes = (appointment.notes ? appointment.notes + ' · ' : '') + `Payment received: PKR ${payAmount} (${method || 'Cash'})`
    }
    await appointment.save()

    // Create a Payment document for permanent financial audit and receipt
    const invoiceNo = `INV-${Math.floor(1000 + Math.random() * 9000)}`
    const payment = await Payment.create({
      invoiceNo,
      appointmentId: appointment._id,
      appointmentRef: appointment.ref,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone || '',
      serviceName: appointment.serviceName,
      staffName: appointment.staffName,
      totalAmount: price,
      amountPaid: payAmount,
      outstandingAmount: newOutstanding,
      amount: payAmount,
      method: method || 'Cash',
      status: newPaymentStatus,
      date: new Date().toISOString().slice(0, 10),
      notes: notes || `Payment for booking ${appointment.ref}`,
    })

    res.json({
      success: true,
      message: `Payment of PKR ${payAmount.toLocaleString()} recorded successfully (${newPaymentStatus.replace('_', ' ')})`,
      appointment,
      payment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message,
    })
  }
}

// PUT /api/appointments/:id/reschedule
export const rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body
    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'New date and time are required' })
    }

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    // Validate new slot
    const validation = await validateAppointmentBooking({
      staffId: appointment.staffId,
      serviceId: appointment.serviceId,
      date,
      time,
      durationMin: appointment.durationMin,
      excludeAppointmentId: appointment._id,
    })

    if (!validation.valid) {
      return res.status(409).json({
        success: false,
        message: validation.error,
      })
    }

    appointment.date = date
    appointment.time = time
    appointment.notes = (appointment.notes ? appointment.notes + ' · ' : '') + `Rescheduled to ${date} ${time}`
    await appointment.save()

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment',
      error: error.message,
    })
  }
}

// GET /api/availability
// Calculates available slots for given staffId, date, and durationMin using salon opening hours, staff shift, breaks, leaves, and booked intervals
export const getAvailability = async (req, res) => {
  try {
    const { staffId, date, durationMin } = req.query
    if (!staffId || !date) {
      return res.status(400).json({ success: false, message: 'staffId and date are required' })
    }

    const dayName = getDayName(date)
    const duration = Number(durationMin) || 45

    // Standard booking slot candidates
    const candidateSlots = [
      '10:00 am',
      '10:30 am',
      '11:00 am',
      '11:30 am',
      '12:00 pm',
      '12:30 pm',
      '01:00 pm',
      '01:30 pm',
      '02:00 pm',
      '02:30 pm',
      '03:00 pm',
      '03:30 pm',
      '04:00 pm',
      '04:30 pm',
      '05:00 pm',
      '05:30 pm',
      '06:00 pm',
      '06:30 pm',
      '07:00 pm',
      '07:30 pm',
    ]

    // Fetch Staff Member
    const staffMember = await Staff.findOne({
      $or: [{ _id: staffId.match(/^[0-9a-fA-F]{24}$/) ? staffId : null }, { legacyId: staffId }, { id: staffId }],
    })

    if (!staffMember || staffMember.status !== 'active') {
      return res.json({
        success: true,
        date,
        staffId,
        slots: candidateSlots.map((s) => ({ label: s, available: false })),
        message: 'Specialist is currently inactive or unavailable.',
      })
    }

    // Check Leave
    const isOnLeave = staffMember.leaves?.some((l) => l.date === date)
    if (isOnLeave) {
      return res.json({
        success: true,
        date,
        staffId,
        slots: candidateSlots.map((s) => ({ label: s, available: false })),
        message: 'Specialist is on approved leave.',
      })
    }

    // Check staff scheduled working days
    const workingDays = staffMember.schedule?.days || [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    if (!workingDays.includes(dayName)) {
      return res.json({
        success: true,
        date,
        staffId,
        slots: candidateSlots.map((s) => ({ label: s, available: false })),
        message: `Specialist does not work on ${dayName}s.`,
      })
    }

    // Salon settings & opening hours
    const settings = (await Setting.findOne()) || {}
    const daySetting = settings.openingHours?.find((h) => h.day === dayName)

    if (daySetting && daySetting.closed) {
      return res.json({
        success: true,
        date,
        staffId,
        slots: candidateSlots.map((s) => ({ label: s, available: false })),
        message: 'Salon is closed on this day.',
      })
    }

    const salonOpenMin = daySetting ? timeToMinutes(daySetting.open || '10:00') : 600
    const salonCloseMin = daySetting ? timeToMinutes(daySetting.close || '20:00') : 1200

    const shiftStartMin = timeToMinutes(staffMember.schedule?.shiftStart || '10:00')
    const shiftEndMin = timeToMinutes(staffMember.schedule?.shiftEnd || '19:00')

    let breakStartMin = 0
    let breakEndMin = 0
    if (staffMember.schedule?.breakTime && staffMember.schedule.breakTime.includes('-')) {
      const [bStart, bEnd] = staffMember.schedule.breakTime.split('-').map((s) => s.trim())
      breakStartMin = timeToMinutes(bStart)
      breakEndMin = timeToMinutes(bEnd)
    }

    // Find existing booked appointments for this specialist on this date
    const bookedAppts = await Appointment.find({
      staffId: { $in: [staffMember._id.toString(), staffMember.legacyId, staffId] },
      date,
      status: { $in: ['pending', 'confirmed', 'completed'] },
    })

    const bookedIntervals = bookedAppts.map((a) => {
      const s = timeToMinutes(a.time)
      const dur = Number(a.durationMin) || 45
      return { start: s, end: s + dur }
    })

    // Evaluate each candidate slot
    const slots = candidateSlots.map((timeStr) => {
      const slotStart = timeToMinutes(timeStr)
      const slotEnd = slotStart + duration

      // Must be within salon hours
      if (slotStart < salonOpenMin || slotEnd > salonCloseMin) {
        return { label: timeStr, available: false }
      }

      // Must be within staff shift
      if (slotStart < shiftStartMin || slotEnd > shiftEndMin) {
        return { label: timeStr, available: false }
      }

      // Must not collide with break
      if (breakStartMin && breakEndMin && slotStart < breakEndMin && slotEnd > breakStartMin) {
        return { label: timeStr, available: false }
      }

      // Must not overlap with any existing booked appointment
      const hasConflict = bookedIntervals.some((b) => slotStart < b.end && slotEnd > b.start)
      if (hasConflict) {
        return { label: timeStr, available: false }
      }

      return { label: timeStr, available: true }
    })

    res.json({
      success: true,
      date,
      staffId,
      slots,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate availability slots',
      error: error.message,
    })
  }
}
