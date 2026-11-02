import { Staff } from '../models/Staff.js'
import { Service } from '../models/Service.js'
import { deleteFromCloudinary } from '../config/cloudinary.js'

// Helper to sanitize & enforce specialty subset rule and resolve readable names
export const processStaffSpecialties = async (serviceIds = [], rawSpecialties = []) => {
  // Enforce specialty constraint: must be a subset of assigned serviceIds
  const specialtyServiceIds = rawSpecialties.filter((id) =>
    serviceIds.some((sId) => sId.toString() === id.toString())
  )

  // Look up services to generate human-readable specialty labels
  const validObjectIds = specialtyServiceIds.filter(
    (id) => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)
  )

  const matchedServices = await Service.find({
    $or: [{ _id: { $in: validObjectIds } }, { legacyId: { $in: specialtyServiceIds } }],
  })

  const specialties = matchedServices.map((s) => s.name)

  return { specialtyServiceIds, specialties }
}

// GET /api/staff
export const getStaff = async (req, res) => {
  try {
    const { status, serviceId, search } = req.query
    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }
    if (serviceId && serviceId !== 'all') {
      filter.serviceIds = serviceId
    }
    if (search) {
      const q = search.trim()
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } },
        { specialties: { $regex: q, $options: 'i' } },
      ]
    }

    const staffList = await Staff.find(filter).sort({ name: 1 })
    res.json({
      success: true,
      count: staffList.length,
      staff: staffList,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve staff directory',
      error: error.message,
    })
  }
}

// GET /api/staff/featured (Public endpoint for homepage)
export const getFeaturedStaff = async (req, res) => {
  try {
    let featuredStaff = await Staff.find({
      status: 'active',
      isFeatured: true,
    })
      .sort({ featuredOrder: 1, createdAt: 1 })
      .limit(4)

    // Sensible fallback: if no staff is explicitly featured, return first 4 active staff
    if (featuredStaff.length === 0) {
      featuredStaff = await Staff.find({ status: 'active' })
        .sort({ years: -1, createdAt: 1 })
        .limit(4)
    }

    res.json({
      success: true,
      count: featuredStaff.length,
      staff: featuredStaff,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured staff',
      error: error.message,
    })
  }
}

// GET /api/staff/:id
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' })
    }
    res.json({ success: true, staff })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve staff member', error: error.message })
  }
}

// POST /api/staff
export const createStaff = async (req, res) => {
  try {
    const {
      name,
      role,
      email,
      phone,
      years,
      bio,
      avatar,
      avatarPublicId,
      status,
      isFeatured,
      featuredOrder,
      serviceIds = [],
      specialtyServiceIds = [],
      schedule,
    } = req.body

    if (!name || !role || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, role, and phone are required.',
      })
    }

    const finalIsFeatured = !!isFeatured
    const finalFeaturedOrder = Number(featuredOrder) || 0

    if (finalIsFeatured) {
      if (status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: 'Only active staff members can be featured on the homepage.',
        })
      }
      const count = await Staff.countDocuments({ status: 'active', isFeatured: true })
      if (count >= 4) {
        return res.status(400).json({
          success: false,
          message: 'A maximum of 4 staff members can be featured on the homepage. Please unfeature another staff member first.',
        })
      }
    }

    const { specialtyServiceIds: validatedSpecialties, specialties } =
      await processStaffSpecialties(serviceIds, specialtyServiceIds)

    const staff = await Staff.create({
      name: name.trim(),
      role: role.trim(),
      email: email ? email.trim() : '',
      phone: phone.trim(),
      years: Number(years) || 1,
      bio: bio ? bio.trim() : '',
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      avatarPublicId: avatarPublicId || '',
      status: status || 'active',
      isFeatured: finalIsFeatured,
      featuredOrder: finalFeaturedOrder,
      serviceIds,
      specialtyServiceIds: validatedSpecialties,
      specialties,
      schedule: schedule || {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        shiftStart: '10:00',
        shiftEnd: '19:00',
        breakTime: '13:00 - 14:00',
      },
    })

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      staff,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create staff member',
      error: error.message,
    })
  }
}

// PUT /api/staff/:id
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' })
    }

    const {
      name,
      role,
      email,
      phone,
      years,
      bio,
      avatar,
      avatarPublicId,
      status,
      isFeatured,
      featuredOrder,
      serviceIds,
      specialtyServiceIds,
      schedule,
    } = req.body

    if (name) staff.name = name.trim()
    if (role) staff.role = role.trim()
    if (email !== undefined) staff.email = email.trim()
    if (phone) staff.phone = phone.trim()
    if (years !== undefined) staff.years = Number(years)
    if (bio !== undefined) staff.bio = bio.trim()

    // Handle image replacement and cleanup old asset
    if (avatar && avatar !== staff.avatar) {
      if (staff.avatarPublicId && staff.avatarPublicId !== avatarPublicId) {
        await deleteFromCloudinary(staff.avatarPublicId).catch(() => null)
      }
      staff.avatar = avatar.trim()
      staff.avatarPublicId = avatarPublicId || ''
    }

    if (status) {
      staff.status = status
      // Deactivated staff must not be featured on public homepage
      if (status === 'inactive') {
        staff.isFeatured = false
      }
    }

    if (isFeatured !== undefined) {
      if (isFeatured) {
        if (staff.status === 'inactive') {
          return res.status(400).json({
            success: false,
            message: 'Only active staff members can be featured on the homepage.',
          })
        }
        const otherFeaturedCount = await Staff.countDocuments({
          _id: { $ne: staff._id },
          status: 'active',
          isFeatured: true,
        })
        if (otherFeaturedCount >= 4) {
          return res.status(400).json({
            success: false,
            message: 'A maximum of 4 staff members can be featured on the homepage. Please unfeature another staff member first.',
          })
        }
        staff.isFeatured = true
      } else {
        staff.isFeatured = false
      }
    }

    if (featuredOrder !== undefined) {
      staff.featuredOrder = Number(featuredOrder) || 0
    }

    if (schedule) staff.schedule = schedule

    // If services or specialties were updated, re-validate relationship constraint
    if (serviceIds !== undefined || specialtyServiceIds !== undefined) {
      const targetServiceIds = serviceIds !== undefined ? serviceIds : staff.serviceIds
      const targetSpecialties =
        specialtyServiceIds !== undefined ? specialtyServiceIds : staff.specialtyServiceIds

      const { specialtyServiceIds: validatedSpecialties, specialties } =
        await processStaffSpecialties(targetServiceIds, targetSpecialties)

      staff.serviceIds = targetServiceIds
      staff.specialtyServiceIds = validatedSpecialties
      staff.specialties = specialties
    }

    await staff.save()

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      staff,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: error.message,
    })
  }
}

// PUT /api/staff/:id/featured (Dedicated toggle for admin table/modal)
export const toggleStaffFeatured = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' })
    }

    const { isFeatured, featuredOrder } = req.body
    const targetFeatured = isFeatured !== undefined ? !!isFeatured : !staff.isFeatured

    if (targetFeatured) {
      if (staff.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Only active staff members can be featured on the homepage. Please activate this staff member first.',
        })
      }

      const count = await Staff.countDocuments({
        _id: { $ne: staff._id },
        status: 'active',
        isFeatured: true,
      })

      if (count >= 4) {
        return res.status(400).json({
          success: false,
          message: 'A maximum of 4 staff members can be featured on the homepage. Please unfeature another staff member first.',
        })
      }

      staff.isFeatured = true
      if (featuredOrder !== undefined) staff.featuredOrder = Number(featuredOrder) || 0
    } else {
      staff.isFeatured = false
      if (featuredOrder !== undefined) staff.featuredOrder = Number(featuredOrder) || 0
    }

    await staff.save()

    res.json({
      success: true,
      message: staff.isFeatured
        ? `"${staff.name}" is now featured on the homepage (Order: ${staff.featuredOrder}).`
        : `"${staff.name}" was unfeatured from the homepage.`,
      staff,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update featured status',
      error: error.message,
    })
  }
}

// PUT /api/staff/:id/status
export const toggleStaffStatus = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' })
    }

    staff.status = staff.status === 'active' ? 'inactive' : 'active'
    if (staff.status === 'inactive') {
      staff.isFeatured = false
    }
    await staff.save()

    res.json({
      success: true,
      message: `Staff member marked as ${staff.status}`,
      staff,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle staff status',
      error: error.message,
    })
  }
}

// POST /api/staff/:id/leaves
export const addStaffLeave = async (req, res) => {
  try {
    const { date, reason } = req.body
    if (!date) {
      return res.status(400).json({ success: false, message: 'Leave date is required' })
    }

    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' })
    }

    staff.leaves.push({
      date,
      reason: reason || 'Scheduled Leave',
    })
    await staff.save()

    res.status(201).json({
      success: true,
      message: 'Staff leave scheduled successfully',
      leaves: staff.leaves,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to schedule leave', error: error.message })
  }
}

// DELETE /api/staff/:id/leaves/:leaveId
export const removeStaffLeave = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' })
    }

    staff.leaves = staff.leaves.filter((l) => l._id.toString() !== req.params.leaveId)
    await staff.save()

    res.json({
      success: true,
      message: 'Staff leave removed',
      leaves: staff.leaves,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove leave', error: error.message })
  }
}

// DELETE /api/staff/:id
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' })
    }

    // Safely cleanup old Cloudinary avatar asset if present
    if (staff.avatarPublicId) {
      await deleteFromCloudinary(staff.avatarPublicId).catch(() => null)
    }

    await Staff.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Staff member removed successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member',
      error: error.message,
    })
  }
}
