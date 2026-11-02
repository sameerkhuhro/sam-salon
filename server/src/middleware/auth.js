import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'

export const protect = async (req, res, next) => {
  try {
    let token

    // 1. Check Authorization Bearer header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    // 2. Check secure HttpOnly cookie
    else if (req.cookies && req.cookies.salonhub_token) {
      token = req.cookies.salonhub_token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access the administrator portal.',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'salonhub_fallback_jwt_secret')

    const admin = await Admin.findById(decoded.id).select('-password')

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'The admin user associated with this session no longer exists.',
      })
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This admin account is currently deactivated. Please contact salon management.',
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative session token. Please sign in again.',
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your administrator session has expired. Please sign in again.',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication processing error',
      error: error.message,
    })
  }
}

// Extensible role-based check
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to perform this administrative operation.',
      })
    }
    next()
  }
}
