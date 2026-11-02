import { Category } from '../models/Category.js'
import { Service } from '../models/Service.js'

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const { status, gender } = req.query
    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }
    if (gender && gender !== 'All') {
      filter.gender = { $in: [gender, 'Unisex'] }
    }

    const categories = await Category.find(filter).sort({ order: 1, name: 1 })
    res.json({
      success: true,
      count: categories.length,
      categories,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message,
    })
  }
}

// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const services = await Service.find({
      $or: [{ categoryId: category._id }, { category: category.name }],
    })

    res.json({ success: true, category, services })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch category', error: error.message })
  }
}

// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, description, gender, icon, image, order } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      })
    }

    const existing = await Category.findOne({ name: name.trim() })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      })
    }

    const count = await Category.countDocuments()

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      gender: gender || 'Unisex',
      icon: icon || 'Scissors',
      image: image || { url: '', publicId: '' },
      order: order !== undefined ? Number(order) : count + 1,
      status: 'active',
    })

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    })
  }
}

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { name, description, gender, icon, image, order, status } = req.body
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const oldName = category.name

    if (name) category.name = name.trim()
    if (description !== undefined) category.description = description.trim()
    if (gender) category.gender = gender
    if (icon) category.icon = icon
    if (image) category.image = image
    if (order !== undefined) category.order = Number(order)
    if (status) category.status = status

    await category.save()

    // If name changed, update referencing services
    if (name && name.trim() !== oldName) {
      await Service.updateMany({ category: oldName }, { category: name.trim() })
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    })
  }
}

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    // Check if services are actively using this category
    const servicesCount = await Service.countDocuments({
      $or: [{ categoryId: category._id }, { category: category.name }],
    })

    if (servicesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${servicesCount} service(s) are currently categorized under it. Please reassign those services first or deactivate the category.`,
      })
    }

    await Category.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    })
  }
}
