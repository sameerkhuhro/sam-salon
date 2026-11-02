import React, { useState, useRef } from 'react'
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { adminService } from '../../services/adminService'

export default function ImageUpload({
  label = 'Image',
  value = '',
  onChange,
  folder = 'general',
  aspect = 'square', // 'square' | 'video' | 'auto'
  helperText = 'JPG, PNG, or WebP up to 5MB',
  className = '',
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Current URL helper (handles string or object { url, publicId })
  const currentUrl = typeof value === 'object' && value !== null ? value.url || '' : value || ''

  const handleFile = async (file) => {
    if (!file) return

    // MIME check
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image.')
      return
    }

    // Size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be smaller than 5MB.')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      const response = await adminService.uploadImage(file, folder)
      if (response && response.url) {
        if (typeof onChange === 'function') {
          onChange(response.url, response.publicId || '')
        }
      } else {
        throw new Error('Invalid response from upload service')
      }
    } catch (err) {
      console.error('Image upload failed:', err)
      setError(err.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    if (typeof onChange === 'function') {
      onChange('', '')
    }
    setError('')
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-serif uppercase tracking-widest text-[#71665D]">
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 flex flex-col items-center justify-center p-4 text-center ${
          dragActive
            ? 'border-[#C7A66A] bg-[#C7A66A]/10'
            : currentUrl
            ? 'border-taupe/30 bg-[#24211F]/5 hover:border-[#C7A66A]/60'
            : 'border-[#71665D]/20 bg-[#24211F]/5 hover:border-[#C7A66A]/50 hover:bg-[#C7A66A]/5'
        } ${
          aspect === 'square'
            ? 'min-h-[160px]'
            : aspect === 'video'
            ? 'min-h-[180px] aspect-video'
            : 'min-h-[140px]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0])
            }
          }}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <Loader2 className="w-8 h-8 text-[#C7A66A] animate-spin" />
            <p className="text-xs tracking-wider uppercase text-[#71665D] font-medium animate-pulse">
              Uploading & Optimizing...
            </p>
          </div>
        ) : currentUrl ? (
          <div className="relative w-full h-full min-h-[140px] flex items-center justify-center">
            <img
              src={currentUrl}
              alt="Upload preview"
              className={`object-cover rounded-lg shadow-sm max-h-[220px] w-auto ${
                aspect === 'square' ? 'h-36 w-36 rounded-full border-2 border-[#C7A66A]/40' : 'w-full h-40'
              }`}
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-[#24211F]/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 rounded-lg text-white">
              <UploadCloud className="w-6 h-6 text-[#C7A66A]" />
              <span className="text-xs font-serif tracking-wider">Click or drag to change</span>
              <button
                type="button"
                onClick={handleRemove}
                className="mt-1 px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-xs rounded-full flex items-center gap-1 transition"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 space-y-2 text-[#71665D]">
            <div className="w-12 h-12 rounded-full bg-[#C7A66A]/10 text-[#C7A66A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-serif tracking-wider text-[#24211F] font-semibold">
                Click to browse or drop image here
              </p>
              <p className="text-[11px] text-[#71665D] mt-0.5">{helperText}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
