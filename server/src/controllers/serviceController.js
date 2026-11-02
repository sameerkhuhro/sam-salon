import { Service } from '../models/Service.js'
import { Staff } from '../models/Staff.js'
import { deleteFromCloudinary } from '../config/cloudinary.js'

// GET /api/services
export const getServices = async (req, res) => {
  try {
    const { status, category, gender, search } = req.query
    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }
    if (category && category !== 'All') {
      filter.category = category
    }
    if (gender && gender !== 'All') {
      filter.gender = { $in: [gender, 'Unisex'] }
    }
    if (search) {
      const q = search.trim()
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ]
    }

    const services = await Service.find(filter).sort({ category: 1, name: 1 })
    res.json({
      success: true,
      count: services.length,
      services,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve services',
      error: error.message,
    })
  }
}

// GET /api/services/featured (Public endpoint for homepage)
export const getFeaturedServices = async (req, res) => {
  try {
    let featuredServices = await Service.find({
      status: 'active',
      isFeatured: true,
    }).sort({ featuredOrder: 1, createdAt: 1 })

    // If none are explicitly featured, sensible fallback to active popular services (up to 6)
    if (featuredServices.length === 0) {
      featuredServices = await Service.find({ status: 'active' })
        .sort({ popular: -1, price: -1 })
        .limit(6)
    }

    res.json({
      success: true,
      count: featuredServices.length,
      services: featuredServices,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured services',
      error: error.message,
    })
  }
}

// GET /api/services/:id
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }
    res.json({ success: true, service })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service', error: error.message })
  }
}

// POST /api/services
export const createService = async (req, res) => {
  try {
    const {
      name,
      category,
      categoryId,
      description,
      price,
      durationMin,
      gender,
      image,
      popular,
      isFeatured,
      featuredOrder,
    } = req.body

    if (!name || !category || price === undefined || !durationMin) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and duration are required.',
      })
    }

    const finalIsFeatured = !!isFeatured
    const finalFeaturedOrder = Number(featuredOrder) || 0

    const service = await Service.create({
      name: name.trim(),
      category: category.trim(),
      categoryId: categoryId || null,
      description: description ? description.trim() : '',
      price: Number(price),
      durationMin: Number(durationMin),
      gender: gender || 'Unisex',
      image: typeof image === 'string' ? { url: image, publicId: '' } : (image || { url: '', publicId: '' }),
      popular: !!popular,
      isFeatured: finalIsFeatured,
      featuredOrder: finalFeaturedOrder,
      status: 'active',
    })

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message,
    })
  }
}

// PUT /api/services/:id
export const updateService = async (req, res) => {
  try {
    const {
      name,
      category,
      categoryId,
      description,
      price,
      durationMin,
      gender,
      image,
      popular,
      isFeatured,
      featuredOrder,
      status,
    } = req.body

    const service = await Service.findById(req.params.id)

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    const oldName = service.name

    if (name) service.name = name.trim()
    if (category) service.category = category.trim()
    if (categoryId !== undefined) service.categoryId = categoryId
    if (description !== undefined) service.description = description.trim()
    if (price !== undefined) service.price = Number(price)
    if (durationMin !== undefined) service.durationMin = Number(durationMin)
    if (gender) service.gender = gender

    // Handle image update & cleanup old asset
    if (image !== undefined) {
      const newImage = typeof image === 'string' ? { url: image, publicId: '' } : image
      if (service.image?.publicId && service.image.publicId !== newImage?.publicId) {
        await deleteFromCloudinary(service.image.publicId).catch(() => null)
      }
      service.image = newImage
    }

    if (popular !== undefined) service.popular = !!popular

    if (status) {
      service.status = status
      // Deactivated services must not appear on public homepage
      if (status === 'inactive') {
        service.isFeatured = false
      }
    }

    if (isFeatured !== undefined) {
      if (isFeatured) {
        const targetStatus = status || service.status
        if (targetStatus === 'inactive') {
          return res.status(400).json({
            success: false,
            message: 'Only active services can be featured on the homepage.',
          })
        }
        service.isFeatured = true
      } else {
        service.isFeatured = false
      }
    }

    if (featuredOrder !== undefined) {
      service.featuredOrder = Number(featuredOrder) || 0
    }

    await service.save()

    // Propagate updated name to staff members' derived specialties
    if (name && name.trim() !== oldName) {
      const staffMembers = await Staff.find({
        $or: [{ serviceIds: service._id.toString() }, { serviceIds: service.legacyId }],
      })

      for (const st of staffMembers) {
        if (st.specialtyServiceIds?.some((id) => id === service._id.toString() || id === service.legacyId)) {
          const allServices = await Service.find({
            _id: { $in: st.specialtyServiceIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) },
          })
          st.specialties = allServices.map((s) => s.name)
          await st.save()
        }
      }
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message,
    })
  }
}

// PUT /api/services/:id/featured (Dedicated toggle for admin table/modal)
export const toggleServiceFeatured = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    const { isFeatured, featuredOrder } = req.body
    const targetFeatured = isFeatured !== undefined ? !!isFeatured : !service.isFeatured

    if (targetFeatured) {
      if (service.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Only active services can be featured on the homepage. Please activate this service first.',
        })
      }
      service.isFeatured = true
      if (featuredOrder !== undefined) service.featuredOrder = Number(featuredOrder) || 0
    } else {
      service.isFeatured = false
      if (featuredOrder !== undefined) service.featuredOrder = Number(featuredOrder) || 0
    }

    await service.save()

    res.json({
      success: true,
      message: service.isFeatured
        ? `"${service.name}" is now featured on the homepage (Order: ${service.featuredOrder}).`
        : `"${service.name}" was unfeatured from the homepage.`,
      service,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update featured service status',
      error: error.message,
    })
  }
}

// PUT /api/services/:id/status
export const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    service.status = service.status === 'active' ? 'inactive' : 'active'
    if (service.status === 'inactive') {
      service.isFeatured = false
    }
    await service.save()

    res.json({
      success: true,
      message: `Service marked as ${service.status}`,
      service,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service status',
      error: error.message,
    })
  }
}

// DELETE /api/services/:id
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }

    // Safely delete Cloudinary asset if present
    if (service.image?.publicId) {
      await deleteFromCloudinary(service.image.publicId).catch(() => null)
    }

    await Service.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Service removed successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message,
    })
  }
}
