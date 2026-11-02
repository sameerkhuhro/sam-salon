import mongoose from 'mongoose'

const staffSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff member name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    years: {
      type: Number,
      default: 1,
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    avatarPublicId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
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
    // References to Services (stored as IDs / ObjectIds, single source of truth)
    serviceIds: [
      {
        type: String,
        ref: 'Service',
      },
    ],
    // Subset of serviceIds indicating signature specialties
    specialtyServiceIds: [
      {
        type: String,
        ref: 'Service',
      },
    ],
    // Derived human-readable specialty labels for fast lookup
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    schedule: {
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      shiftStart: {
        type: String,
        default: '10:00',
      },
      shiftEnd: {
        type: String,
        default: '19:00',
      },
      breakTime: {
        type: String,
        default: '13:00 - 14:00',
      },
    },
    leaves: [
      {
        date: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          default: 'Scheduled Leave',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const Staff = mongoose.model('Staff', staffSchema)
