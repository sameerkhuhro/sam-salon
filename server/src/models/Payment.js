import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    appointmentRef: {
      type: String,
      trim: true,
      default: '',
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    staffName: {
      type: String,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Keep amount for backward compatibility
    amount: {
      type: Number,
      default: function () {
        return this.amountPaid || this.totalAmount || 0
      },
    },
    method: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'Online', 'Other'],
      default: 'Cash',
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'refunded', 'partial', 'partially_paid'],
      default: 'paid',
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    refunds: [
      {
        amount: {
          type: Number,
          required: true,
        },
        reason: {
          type: String,
          default: 'Customer requested refund',
        },
        date: {
          type: String,
          default: () => new Date().toISOString().slice(0, 10),
        },
        processedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export const Payment = mongoose.model('Payment', paymentSchema)
