import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { Admin } from '../models/Admin.js'
import { Category } from '../models/Category.js'
import { Service } from '../models/Service.js'
import { Staff } from '../models/Staff.js'
import { Customer } from '../models/Customer.js'
import { Appointment } from '../models/Appointment.js'
import { Payment } from '../models/Payment.js'
import { Setting } from '../models/Setting.js'

const SEED_CATEGORIES = [
  {
    name: 'Hair',
    description: 'Precision cuts, bespoke blow-dries, and keratin smoothing rituals for all hair textures.',
    gender: 'Unisex',
    icon: 'Scissors',
    order: 1,
  },
  {
    name: 'Grooming',
    description: "Men's precision fades, executive hot towel shaves, and beard conditioning rituals.",
    gender: 'Men',
    icon: 'Sparkles',
    order: 2,
  },
  {
    name: 'Skin',
    description: 'Botanical radiance facials, hydra-infusion therapies, and bridal occasion aesthetics.',
    gender: 'Unisex',
    icon: 'Smile',
    order: 3,
  },
  {
    name: 'Colour',
    description: 'Dimensional balayage, corrective colour, and gloss toner treatments.',
    gender: 'Women',
    icon: 'Palette',
    order: 4,
  },
  {
    name: 'Nails',
    description: 'Luxury manicures, pedicures, and nail polish care.',
    gender: 'Women',
    icon: 'Gem',
    order: 5,
  },
  {
    name: 'Relax',
    description: 'Aromatherapy scalp massage and stress-relieving head spa treatments.',
    gender: 'Unisex',
    icon: 'Heart',
    order: 6,
  },
]

const SEED_SERVICES = [
  // Hair & Styling
  {
    legacyId: 's1',
    category: 'Hair',
    name: 'Signature Cut & Style',
    description: 'Detailed consultation, hair wash, precision bespoke haircut and editorial blow-dry finish.',
    price: 2500,
    durationMin: 60,
    gender: 'Unisex',
    popular: true,
  },
  {
    legacyId: 's2',
    category: 'Hair',
    name: 'Blow-dry & Glamour Finish',
    description: 'Smooth, voluminous or textured curling styled for everyday luxury or special events.',
    price: 1500,
    durationMin: 45,
    gender: 'Women',
    popular: true,
  },
  {
    legacyId: 's3',
    category: 'Hair',
    name: 'Keratin Protein Smoothing',
    description: 'Intense anti-frizz formula with long-lasting silkiness, mirror shine and humidity defense.',
    price: 12000,
    durationMin: 150,
    gender: 'Women',
    popular: false,
  },

  // Men's Grooming
  {
    legacyId: 's10',
    category: 'Grooming',
    name: "Men's Precision Fade & Beard Trim",
    description: 'Tailored skin/taper fade haircut paired with hot-towel beard shaping and razor lining.',
    price: 1800,
    durationMin: 45,
    gender: 'Men',
    popular: true,
  },
  {
    legacyId: 's11',
    category: 'Grooming',
    name: 'Executive Hot Towel Shave',
    description: 'Pre-shave essential oils, dual hot towels, traditional straight-razor shave and soothing balm.',
    price: 1200,
    durationMin: 30,
    gender: 'Men',
    popular: false,
  },
  {
    legacyId: 's12',
    category: 'Grooming',
    name: "Gentleman's Charcoal Facial",
    description: 'Deep pore purification, beard conditioning steam treatment, and revitalizing face massage.',
    price: 3200,
    durationMin: 45,
    gender: 'Men',
    popular: false,
  },

  // Skincare & Aesthetics
  {
    legacyId: 's6',
    category: 'Skin',
    name: 'Signature Glow Facial',
    description: 'Deep botanical cleanse, ultrasound peeling, firming facial massage and 24k gold radiance mask.',
    price: 4500,
    durationMin: 60,
    gender: 'Unisex',
    popular: true,
  },
  {
    legacyId: 's7',
    category: 'Skin',
    name: 'Bridal & Occasion Makeup',
    description: 'Long-wear luxury bridal makeup, contouring, premium lash application and setting veil.',
    price: 25000,
    durationMin: 120,
    gender: 'Women',
    popular: true,
  },
  {
    legacyId: 's13',
    category: 'Skin',
    name: 'Hydra-Infusion Facial',
    description: 'Intensive hydration infusion using hyaluronic acid serum and cooling cryo-globe therapy.',
    price: 6000,
    durationMin: 60,
    gender: 'Unisex',
    popular: false,
  },

  // Colour & Highlights
  {
    legacyId: 's4',
    category: 'Colour',
    name: 'Full Color & Gloss',
    description: 'All-over single process tone, roots-to-ends coverage, bonded gloss treatment.',
    price: 7000,
    durationMin: 120,
    gender: 'Unisex',
    popular: false,
  },
  {
    legacyId: 's5',
    category: 'Colour',
    name: 'Signature Balayage & Toning',
    description: 'Custom hand-painted multidimensional blonde or caramel highlights with glazed finish.',
    price: 15000,
    durationMin: 180,
    gender: 'Women',
    popular: true,
  },

  // Nails
  {
    legacyId: 's8',
    category: 'Nails',
    name: 'Classic Luxury Manicure',
    description: 'Nail shaping, gentle cuticle care, exfoliating scrub, hand massage and gel polish.',
    price: 1800,
    durationMin: 45,
    gender: 'Unisex',
    popular: false,
  },
  {
    legacyId: 's9',
    category: 'Nails',
    name: 'Deluxe Spa Pedicure',
    description: 'Aromatherapy foot soak, callus refining, sea-salt scrub, restorative massage and polish.',
    price: 2500,
    durationMin: 60,
    gender: 'Unisex',
    popular: false,
  },

  // Relaxation
  {
    legacyId: 's14',
    category: 'Relax',
    name: 'Express Scalp & Neck Massage',
    description: 'Aromatic therapeutic oils, targeted acupressure stress-relief and hot towel neck wrap.',
    price: 1200,
    durationMin: 30,
    gender: 'Unisex',
    popular: false,
  },
  {
    legacyId: 's15',
    category: 'Relax',
    name: 'Full Body Aroma Therapy',
    description: 'Custom blended essential oils, gentle pressure massage, tension release and serene atmosphere.',
    price: 5500,
    durationMin: 75,
    gender: 'Unisex',
    popular: true,
  },
]

export const seedDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salonhub'
    console.log(`[Seed] Connecting to MongoDB: ${uri.replace(/:([^@]+)@/, ':****@')}...`)
    await mongoose.connect(uri, { dbName: 'salonhub' })
  }
  console.log(`[Seed] Database ready for verification & seeding on database: "${mongoose.connection.name}".`)

  // 1. Seed or Verify Initial Admin Account
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@salonhub.pk').toLowerCase()
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'SalonHub@2026!'
  let admin = await Admin.findOne({ email: adminEmail })

  if (!admin) {
    admin = await Admin.create({
      name: process.env.INITIAL_ADMIN_NAME || 'Salon Owner',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      status: 'active',
      phone: process.env.INITIAL_ADMIN_PHONE || '+92 300 1234567',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    })
    console.log(`[Seed] Initial Admin account created: ${admin.email}`)
  } else {
    console.log(`[Seed] Initial Admin account already exists: ${admin.email}`)
  }

  // 2. Seed Categories
  const existingCategoriesCount = await Category.countDocuments()
  let categoryDocMap = {} // Name -> Category Doc

  if (existingCategoriesCount === 0) {
    console.log('[Seed] Seeding service categories...')
    for (const cat of SEED_CATEGORIES) {
      const created = await Category.create(cat)
      categoryDocMap[cat.name] = created
    }
    console.log(`[Seed] Seeded ${SEED_CATEGORIES.length} categories.`)
  } else {
    const allCategories = await Category.find()
    allCategories.forEach((c) => {
      categoryDocMap[c.name] = c
    })
  }

  // 3. Seed Services
  const existingServicesCount = await Service.countDocuments()
  let serviceDocMap = {} // legacyId -> Service Doc

  if (existingServicesCount === 0) {
    console.log('[Seed] Seeding initial service catalog...')
    for (const s of SEED_SERVICES) {
      const catDoc = categoryDocMap[s.category]
      const created = await Service.create({
        ...s,
        categoryId: catDoc ? catDoc._id : undefined,
      })
      serviceDocMap[s.legacyId] = created
    }
    console.log(`[Seed] Seeded ${SEED_SERVICES.length} services.`)
  } else {
    console.log(`[Seed] ${existingServicesCount} services already in database.`)
    const allServices = await Service.find()
    for (const s of allServices) {
      if (s.legacyId) serviceDocMap[s.legacyId] = s
      // Backfill categoryId if missing
      if (!s.categoryId && categoryDocMap[s.category]) {
        s.categoryId = categoryDocMap[s.category]._id
        await s.save()
      }
    }

    const featuredServicesCount = await Service.countDocuments({ isFeatured: true })
    if (featuredServicesCount === 0) {
      console.log('[Seed] Setting default featured services on homepage...')
      const topServices = await Service.find({ status: 'active' })
        .sort({ popular: -1, price: -1 })
        .limit(6)
      for (let i = 0; i < topServices.length; i++) {
        topServices[i].isFeatured = true
        topServices[i].featuredOrder = i + 1
        await topServices[i].save()
      }
    }
  }

  // 3. Seed Staff Members
  const existingStaffCount = await Staff.countDocuments()
  if (existingStaffCount === 0) {
    console.log('[Seed] Seeding master staff specialists with service assignments & specialties...')

    const resolveIds = (legIds = []) => {
      return legIds
        .map((leg) => (serviceDocMap[leg] ? serviceDocMap[leg]._id.toString() : null))
        .filter(Boolean)
    }

    const staffSeedData = [
      {
        legacyId: 't1',
        name: 'Amara Khan',
        role: 'Creative Director & Colorist',
        email: 'amara.khan@salonhub.pk',
        phone: '+92 300 2345671',
        years: 12,
        bio: 'Specialising in multidimensional balayage, corrective colour and bespoke editorial haircuts for women.',
        serviceIds: resolveIds(['s1', 's2', 's3', 's4', 's5']),
        specialtyServiceIds: resolveIds(['s4', 's5']),
        specialties: ['Full Color & Gloss', 'Signature Balayage & Toning'],
        status: 'active',
        isFeatured: true,
        featuredOrder: 1,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        schedule: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
          shiftStart: '10:00',
          shiftEnd: '18:00',
          breakTime: '13:00 - 14:00',
        },
      },
      {
        legacyId: 't2',
        name: 'Zain Ali',
        role: 'Master Barber & Grooming Lead',
        email: 'zain.ali@salonhub.pk',
        phone: '+92 301 3456782',
        years: 9,
        bio: 'Master of modern skin fades, straight-razor hot towel rituals and precision beard sculpting for gentlemen.',
        serviceIds: resolveIds(['s1', 's10', 's11', 's12']),
        specialtyServiceIds: resolveIds(['s10', 's11']),
        specialties: ["Men's Precision Fade & Beard Trim", 'Executive Hot Towel Shave'],
        status: 'active',
        isFeatured: true,
        featuredOrder: 2,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        schedule: {
          days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          shiftStart: '11:00',
          shiftEnd: '20:00',
          breakTime: '14:30 - 15:30',
        },
      },
      {
        legacyId: 't3',
        name: 'Hira Malik',
        role: 'Senior Aesthetician & Makeup Artist',
        email: 'hira.malik@salonhub.pk',
        phone: '+92 302 4567893',
        years: 8,
        bio: 'Certified skincare specialist focused on botanical glow facials, hydra-infusion and red-carpet bridal aesthetics.',
        serviceIds: resolveIds(['s6', 's7', 's8', 's9', 's13']),
        specialtyServiceIds: resolveIds(['s6', 's7']),
        specialties: ['Signature Glow Facial', 'Bridal & Occasion Makeup'],
        status: 'active',
        isFeatured: true,
        featuredOrder: 3,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        schedule: {
          days: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          shiftStart: '12:00',
          shiftEnd: '20:00',
          breakTime: '16:00 - 17:00',
        },
      },
      {
        legacyId: 't4',
        name: 'Bilal Shah',
        role: 'Senior Stylist & Texture Specialist',
        email: 'bilal.shah@salonhub.pk',
        phone: '+92 303 5678904',
        years: 6,
        bio: 'Known for sharp precision cuts, texture refinement, keratin treatments and scalp relaxation therapies.',
        serviceIds: resolveIds(['s1', 's2', 's3', 's4', 's14', 's15']),
        specialtyServiceIds: resolveIds(['s1', 's3']),
        specialties: ['Signature Cut & Style', 'Keratin Protein Smoothing'],
        status: 'active',
        isFeatured: true,
        featuredOrder: 4,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        schedule: {
          days: ['Monday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          shiftStart: '10:00',
          shiftEnd: '19:00',
          breakTime: '14:00 - 15:00',
        },
      },
    ]

    await Staff.insertMany(staffSeedData)
    console.log(`[Seed] Seeded ${staffSeedData.length} staff members.`)
  } else {
    console.log(`[Seed] ${existingStaffCount} staff members already exist.`)
    const featuredStaffCount = await Staff.countDocuments({ isFeatured: true })
    if (featuredStaffCount === 0) {
      console.log('[Seed] Setting default featured staff on homepage...')
      const allActiveStaff = await Staff.find({ status: 'active' }).sort({ createdAt: 1 }).limit(4)
      for (let i = 0; i < allActiveStaff.length; i++) {
        allActiveStaff[i].isFeatured = true
        allActiveStaff[i].featuredOrder = i + 1
        await allActiveStaff[i].save()
      }
    }
  }

  // 4. Seed Settings
  const settingsCount = await Setting.countDocuments()
  if (settingsCount === 0) {
    console.log('[Seed] Seeding salon configuration settings...')
    await Setting.create({
      salonName: 'SAM SALON',
      tagline: 'HAIR • BEAUTY • GROOMING',
      phone: '+92 300 1234567',
      email: 'info@samsalon.pk',
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
    console.log('[Seed] Seeded salon settings.')
  } else {
    // If existing settings still have SalonHub default name, update to SAM SALON
    const currentSetting = await Setting.findOne()
    if (currentSetting && (currentSetting.salonName === 'SalonHub' || !currentSetting.tagline?.includes('HAIR'))) {
      currentSetting.salonName = 'SAM SALON'
      currentSetting.tagline = 'HAIR • BEAUTY • GROOMING'
      currentSetting.email = 'info@samsalon.pk'
      await currentSetting.save()
      console.log('[Seed] Updated existing salon setting to SAM SALON brand.')
    }
  }

  // 5. Seed sample Customers, Appointments & Payments if none exist
  const apptCount = await Appointment.countDocuments()
  if (apptCount === 0) {
    console.log('[Seed] Seeding initial customer & appointment records...')
    const today = new Date().toISOString().slice(0, 10)

    const c1 = await Customer.create({
      name: 'Tariq Mehmood',
      phone: '0300 9876543',
      email: 'tariq.m@gmail.com',
      totalVisits: 3,
      totalSpent: 5400,
      lastVisit: new Date(),
    })

    const c2 = await Customer.create({
      name: 'Sana Rizvi',
      phone: '0301 2345678',
      email: 'sana.r@hotmail.com',
      totalVisits: 5,
      totalSpent: 42000,
      lastVisit: new Date(),
    })

    const appt1 = await Appointment.create({
      ref: 'SH-2610-8492',
      customerId: c1._id,
      customerName: 'Tariq Mehmood',
      customerPhone: '0300 9876543',
      customerEmail: 'tariq.m@gmail.com',
      serviceId: serviceDocMap['s10']?._id.toString() || 's10',
      serviceName: "Men's Precision Fade & Beard Trim",
      price: 1800,
      durationMin: 45,
      staffId: 't2',
      staffName: 'Zain Ali',
      date: today,
      time: '11:00 am',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Cash',
      notes: 'Client prefers natural shape on the neckline.',
    })

    const appt2 = await Appointment.create({
      ref: 'SH-2610-7731',
      customerId: c2._id,
      customerName: 'Sana Rizvi',
      customerPhone: '0301 2345678',
      customerEmail: 'sana.r@hotmail.com',
      serviceId: serviceDocMap['s5']?._id.toString() || 's5',
      serviceName: 'Signature Balayage & Toning',
      price: 15000,
      durationMin: 180,
      staffId: 't1',
      staffName: 'Amara Khan',
      date: today,
      time: '02:00 pm',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Card',
      notes: 'Caramel tones with honey glaze tone.',
    })

    await Payment.create({
      invoiceNo: 'INV-9021',
      appointmentId: appt1._id,
      customerName: 'Tariq Mehmood',
      customerPhone: '0300 9876543',
      serviceName: "Men's Precision Fade & Beard Trim",
      staffName: 'Zain Ali',
      amount: 1800,
      method: 'Cash',
      status: 'paid',
      date: today,
      notes: 'Paid at front desk',
    })

    await Payment.create({
      invoiceNo: 'INV-9022',
      appointmentId: appt2._id,
      customerName: 'Sana Rizvi',
      customerPhone: '0301 2345678',
      serviceName: 'Signature Balayage & Toning',
      staffName: 'Amara Khan',
      amount: 15000,
      method: 'Card',
      status: 'paid',
      date: today,
      notes: 'Paid via POS terminal',
    })

    console.log('[Seed] Seeded sample customers, appointments and payments.')
  }

  console.log('[Seed] Database initialization and seed check completed successfully!')
  return true
}

// Allow direct execution via node src/seed/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Finished. Exiting.')
      process.exit(0)
    })
    .catch((err) => {
      console.error('[Seed Error] Failed:', err)
      process.exit(1)
    })
}

