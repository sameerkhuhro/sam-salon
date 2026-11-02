import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ''
const apiKey = process.env.CLOUDINARY_API_KEY || ''
const apiSecret = process.env.CLOUDINARY_API_SECRET || ''

// Check whether Cloudinary has valid, non-placeholder credentials
export const isCloudinaryConfigured = () => {
  return (
    Boolean(cloudName) &&
    Boolean(apiKey) &&
    Boolean(apiSecret) &&
    !cloudName.includes('<') &&
    !cloudName.includes('your_cloud_name') &&
    !apiKey.includes('<') &&
    !apiKey.includes('your_api_key')
  )
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
  console.log(`[Cloudinary] Initialized with cloud: ${cloudName}`)
} else {
  console.log('[Cloudinary] Running in local/fallback upload mode (placeholder or unconfigured credentials in .env)')
}

/**
 * Upload an image buffer or base64 data to Cloudinary
 * @param {Buffer|string} fileSource - Buffer or base64 string
 * @param {Object} options - { folder: 'salonhub/staff', publicId: 'custom-id', transformation: [] }
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured with active credentials.')
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'salonhub',
        public_id: options.publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: options.transformation || [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        })
      }
    )

    uploadStream.end(fileBuffer)
  })
}

/**
 * Safely delete an image from Cloudinary by public ID
 * @param {string} publicId - Cloudinary asset public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return null

  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.warn(`[Cloudinary Warning] Could not delete asset ${publicId}:`, error.message)
    return null
  }
}

export default cloudinary
