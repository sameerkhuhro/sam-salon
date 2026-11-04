import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    ref: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
      index: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    serviceId: {
      type: String,
      required: [true, 'Service ID is required'],
      ref: 'Service',
    },
    serviceIds: {
      type: [String],
      default: [],
    },
    services: [
      {
        id: String,
        name: String,
        price: Number,
        durationMin: Number,
        category: String,
      },
    ],
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    durationMin: {
      type: Number,
      default: 45,
    },
    staffId: {
      type: String,
      required: [true, 'Staff ID is required'],
      ref: 'Staff',
      index: true,
    },
    staffName: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'refunded', 'partial', 'partially_paid'],
      default: 'unpaid',
      index: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingAmount: {
      type: Number,
      default: function () {
        return Math.max(0, (this.price || 0) - (this.amountPaid || 0))
      },
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'Online'],
      default: 'Cash',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Efficient compound index for staff scheduling and double-booking queries
appointmentSchema.index({ staffId: 1, date: 1, status: 1 })
appointmentSchema.index({ date: 1, time: 1 })

export const Appointment = mongoose.model('Appointment', appointmentSchema)
