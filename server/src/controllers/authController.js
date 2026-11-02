import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'salonhub_fallback_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// Cookie configuration for persistent, secure HttpOnly sessions
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      })
    }

    // Must explicitly select password as it is hidden by default in the schema
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password')

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative email or password.',
      })
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your administrator account has been deactivated. Please contact salon management.',
      })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative email or password.',
      })
    }

    // Update lastLogin timestamp
    admin.lastLogin = new Date()
    await admin.save({ validateBeforeSave: false })

    const token = generateToken(admin._id)

    // Set secure HttpOnly cookie for browser persistence
    res.cookie('salonhub_token', token, cookieOptions)

    // Omit password from response
    const adminObj = admin.toObject()
    delete adminObj.password

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: adminObj,
      user: adminObj,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message,
    })
  }
}

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('salonhub_token', {
      httpOnly: true,
      sameSite: 'lax',
    })
    res.json({
      success: true,
      message: 'Signed out of administrator session successfully.',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout error',
      error: error.message,
    })
  }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.admin,
      user: req.admin,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile',
      error: error.message,
    })
  }
}

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, avatarPublicId } = req.body
    const admin = await Admin.findById(req.admin._id)

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' })
    }

    if (name) admin.name = name.trim()
    if (phone !== undefined) admin.phone = phone.trim()
    if (avatar) admin.avatar = avatar.trim()
    if (avatarPublicId !== undefined) admin.avatarPublicId = avatarPublicId

    await admin.save()

    const adminObj = admin.toObject()
    delete adminObj.password

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: adminObj,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    })
  }
}

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      })
    }

    const admin = await Admin.findById(req.admin._id).select('+password')

    const isMatch = await admin.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      })
    }

    admin.password = newPassword
    await admin.save()

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    })
  }
}
