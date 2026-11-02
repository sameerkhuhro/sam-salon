import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema(
  {
    salonName: {
      type: String,
      default: 'SalonHub',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Where Style Meets Confidence',
    },
    phone: {
      type: String,
      default: '+92 300 1234567',
    },
    email: {
      type: String,
      default: 'info@salonhub.pk',
    },
    address: {
      type: String,
      default: "Mall Road, Near Clock Tower, Khairpur Mir's, Sindh, Pakistan",
    },
    branch: {
      type: String,
      default: "Khairpur Mir's Flagship",
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    timezone: {
      type: String,
      default: 'Asia/Karachi',
    },
    logo: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    gallery: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: '',
        },
        title: {
          type: String,
          default: '',
        },
      },
    ],
    bookingBufferMin: {
      type: Number,
      default: 15,
    },
    advanceBookingDays: {
      type: Number,
      default: 30,
    },
    cancellationPolicy: {
      type: String,
      default: 'Appointments can be cancelled or rescheduled up to 4 hours in advance free of charge.',
    },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        closed: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const Setting = mongoose.model('Setting', settingSchema)
