import { Setting } from '../models/Setting.js'

// GET /api/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create({
        salonName: 'SalonHub',
        tagline: 'Where Style Meets Confidence',
        phone: '+92 300 1234567',
        email: 'info@salonhub.pk',
        address: "Mall Road, Near Clock Tower, Khairpur Mir's, Sindh, Pakistan",
        branch: "Khairpur Mir's Flagship",
        currency: 'PKR',
        timezone: 'Asia/Karachi',
        bookingBufferMin: 15,
        advanceBookingDays: 30,
        cancellationPolicy: 'Appointments can be cancelled or rescheduled up to 4 hours in advance free of charge.',
        openingHours: [
          { day: 'Monday', open: '10:00', close: '20:00', closed: false },
          { day: 'Tuesday', open: '10:00', close: '20:00', closed: false },
          { day: 'Wednesday', open: '10:00', close: '20:00', closed: false },
          { day: 'Thursday', open: '10:00', close: '20:00', closed: false },
          { day: 'Friday', open: '14:00', close: '21:00', closed: false },
          { day: 'Saturday', open: '10:00', close: '21:00', closed: false },
          { day: 'Sunday', open: '11:00', close: '19:00', closed: false },
        ],
      })
    }

    res.json({
      success: true,
      settings,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve salon settings',
      error: error.message,
    })
  }
}

// PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) {
      settings = new Setting()
    }

    const fields = [
      'salonName',
      'tagline',
      'phone',
      'email',
      'address',
      'branch',
      'currency',
      'timezone',
      'bookingBufferMin',
      'advanceBookingDays',
      'cancellationPolicy',
      'openingHours',
    ]

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field]
      }
    })

    await settings.save()

    res.json({
      success: true,
      message: 'Salon configuration updated successfully',
      settings,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update salon settings',
      error: error.message,
    })
  }
}

