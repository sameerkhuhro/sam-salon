import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    durationMin: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      default: 45,
    },
    gender: {
      type: String,
      enum: ['Unisex', 'Men', 'Women'],
      default: 'Unisex',
    },
    image: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

export const Service = mongoose.model('Service', serviceSchema)
