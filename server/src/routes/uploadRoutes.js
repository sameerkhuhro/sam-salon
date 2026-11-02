import { Router } from 'express'
import { uploadImage, deleteImage } from '../controllers/uploadController.js'
import { handleUpload } from '../middleware/upload.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Upload an image (can be file field 'image' or 'file')
router.post('/image', protect, handleUpload('image'), uploadImage)
router.post('/file', protect, handleUpload('file'), uploadImage)

// Public/semi-public upload route for profile pictures or bookings if required
router.post('/public', handleUpload('image'), uploadImage)

// Delete an uploaded asset
router.delete('/image', protect, deleteImage)

export default router
