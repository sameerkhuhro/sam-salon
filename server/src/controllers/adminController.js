import { Admin } from '../models/Admin.js'

// GET /api/admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 })
    res.json({
      success: true,
      count: admins.length,
      admins,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin accounts',
      error: error.message,
    })
  }
}

// POST /api/admins
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, phone, avatar } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required to create an admin account.',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      })
    }

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An administrator account with this email already exists.',
      })
    }

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'admin',
      phone: phone ? phone.trim() : '',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      status: 'active',
    })

    const adminObj = admin.toObject()
    delete adminObj.password

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: adminObj,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account',
      error: error.message,
    })
  }
}

// PUT /api/admins/:id
export const updateAdmin = async (req, res) => {
  try {
    const { name, phone, role, avatar } = req.body
    const admin = await Admin.findById(req.params.id)

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found',
      })
    }

    if (name) admin.name = name.trim()
    if (phone !== undefined) admin.phone = phone.trim()
    if (role) admin.role = role
    if (avatar) admin.avatar = avatar.trim()

    await admin.save()

    const adminObj = admin.toObject()
    delete adminObj.password

    res.json({
      success: true,
      message: 'Admin account updated successfully',
      admin: adminObj,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update admin account',
      error: error.message,
    })
  }
}

// PUT /api/admins/:id/status
export const toggleAdminStatus = async (req, res) => {
  try {
    const adminId = req.params.id

    // Prevent deactivating own account to prevent lockout
    if (req.admin._id.toString() === adminId) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot deactivate your own active session account.',
      })
    }

    const admin = await Admin.findById(adminId)
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found',
      })
    }

    admin.status = admin.status === 'active' ? 'inactive' : 'active'
    await admin.save()

    const adminObj = admin.toObject()
    delete adminObj.password

    res.json({
      success: true,
      message: `Admin account has been ${admin.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      admin: adminObj,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle admin status',
      error: error.message,
    })
  }
}

// PUT /api/admins/:id/password
export const resetAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password is required and must be at least 6 characters long.',
      })
    }

    const admin = await Admin.findById(req.params.id)
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found',
      })
    }

    admin.password = newPassword
    await admin.save()

    res.json({
      success: true,
      message: `Password for ${admin.name} has been reset successfully.`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset admin password',
      error: error.message,
    })
  }
}

// DELETE /api/admins/:id
export const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id

    if (req.admin._id.toString() === adminId) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot delete your own admin account.',
      })
    }

    const count = await Admin.countDocuments({ status: 'active' })
    if (count <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only active salon administrator.',
      })
    }

    const admin = await Admin.findByIdAndDelete(adminId)
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found',
      })
    }

    res.json({
      success: true,
      message: 'Admin account deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin account',
      error: error.message,
    })
  }
}

