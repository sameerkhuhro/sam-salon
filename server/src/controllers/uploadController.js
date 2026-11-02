import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../config/cloudinary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads')

// Ensure local uploads directory exists for fallback mode
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

/**
 * POST /api/upload/image
 * Handles secure image upload to Cloudinary with local fallback
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was provided in the upload request.',
      })
    }

    const folder = req.body.folder || 'general'
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '')

    // If Cloudinary credentials are active in .env, upload to Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: `salonhub/${sanitizedFolder}`,
        })

        return res.status(200).json({
          success: true,
          message: 'Image uploaded to Cloudinary successfully',
          url: result.url,
          publicId: result.publicId,
          provider: 'cloudinary',
          width: result.width,
          height: result.height,
          format: result.format,
        })
      } catch (cloudErr) {
        console.warn('[Cloudinary Upload Error] Falling back to local storage:', cloudErr.message)
      }
    }

    // Local file fallback if Cloudinary is placeholder or temporarily unavailable
    const ext = path.extname(req.file.originalname) || '.jpg'
    const fileName = `${sanitizedFolder}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filePath = path.join(UPLOADS_DIR, fileName)

    await fs.promises.writeFile(filePath, req.file.buffer)

    const host = req.get('host') || 'localhost:5000'
    const protocol = req.protocol || 'http'
    const localUrl = `${protocol}://${host}/uploads/${fileName}`

    return res.status(200).json({
      success: true,
      message: 'Image stored successfully (local fallback storage)',
      url: localUrl,
      publicId: `local:${fileName}`,
      provider: 'local',
    })
  } catch (error) {
    console.error('[Upload Controller Error]:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to process image upload.',
      error: error.message,
    })
  }
}

/**
 * DELETE /api/upload/image
 * Safely destroys an asset from Cloudinary or local storage
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'publicId is required to delete an image asset.',
      })
    }

    if (publicId.startsWith('local:')) {
      const fileName = publicId.replace('local:', '')
      const filePath = path.join(UPLOADS_DIR, fileName)
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath).catch(() => null)
      }
      return res.json({ success: true, message: 'Local image asset deleted successfully' })
    }

    // Cloudinary asset
    const result = await deleteFromCloudinary(publicId)
    return res.json({
      success: true,
      message: 'Cloudinary image asset deleted successfully',
      result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete image asset.',
      error: error.message,
    })
  }
}
