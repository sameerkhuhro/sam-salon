import multer from 'multer'

// Allowed MIME types: JPG, PNG, WebP
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

// File filter to validate image type
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPG, PNG, and WebP images are permitted.`
      ),
      false
    )
  }
}

// Memory storage for clean streaming to Cloudinary or fallback processing
const storage = multer.memoryStorage()

// 5MB maximum file size
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter,
})

// Custom middleware wrapper for graceful Multer error handling
export const handleUpload = (fieldName = 'image') => {
  const uploadSingle = upload.single(fieldName)

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Image size exceeds maximum limit of 5MB. Please upload a smaller image.',
          })
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        })
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        })
      }
      next()
    })
  }
}
