import { useEffect, useState, useMemo } from 'react'
import {
  Scissors,
  Plus,
  Search,
  Clock,
  Edit2,
  Power,
  Tag,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { money, duration } from '@/lib/format'
import StatusBadge from '../components/ui/StatusBadge'
import AdminModal from '../components/ui/AdminModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ImageUpload from '../components/ui/ImageUpload'
import CategoryIcon from '../components/ui/CategoryIcon'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [isNewService, setIsNewService] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    id: '',
    name: '',
    category: 'Hair',
    categoryId: '',
    description: '',
    price: 2000,
    durationMin: 60,
    gender: 'Unisex',
    popular: false,
    isFeatured: false,
    featuredOrder: 1,
    image: '',
    imagePublicId: '',
  })
  const [formErr, setFormErr] = useState({})

  const [confirmToggle, setConfirmToggle] = useState({
    isOpen: false,
    service: null,
  })

  const defaultCategoryNames = ['Hair', 'Grooming', 'Skin', 'Colour', 'Nails', 'Relax']

  const categoryNames = useMemo(() => {
    if (!categories || categories.length === 0) return defaultCategoryNames
    return categories.map((c) => (typeof c === 'object' ? c.name : c))
  }, [categories])

  const featuredServicesCount = useMemo(() => {
    return services.filter((s) => s.isFeatured && s.status === 'active').length
  }, [services])

  const loadData = async () => {
    setLoading(true)
    try {
      const [list, catList] = await Promise.all([
        adminService.getServices(),
        adminService.getCategories().catch(() => []),
      ])
      setServices(list)
      setCategories(catList && catList.length > 0 ? catList : defaultCategoryNames.map((n) => ({ id: n, name: n })))
    } catch (err) {
      console.error('Failed to load services:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Quick toggle featured status directly from table
  const handleToggleServiceFeatured = async (svc) => {
    if (svc.status !== 'active') {
      alert('Only active services can be featured on the homepage.')
      return
    }
    try {
      await adminService.toggleServiceFeatured(svc.id, !svc.isFeatured, svc.featuredOrder || 1)
      await loadData()
    } catch (err) {
      alert(err.message || 'Failed to update featured status.')
    }
  }

  // Filtered Services
  const filteredServices = services.filter((s) => {
    const q = search.toLowerCase()
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    const matchesCat = activeCategory === 'All' || s.category === activeCategory
    const matchesGender = genderFilter === 'All' || s.gender === genderFilter
    return matchesSearch && matchesCat && matchesGender
  })

  // Open Add Modal
  const openAddModal = () => {
    setIsNewService(true)
    const initialCat = activeCategory !== 'All' ? activeCategory : (categoryNames[0] || 'Hair')
    const matchedCat = categories.find((c) => (typeof c === 'object' ? c.name : c) === initialCat)
    setServiceForm({
      id: '',
      name: '',
      category: initialCat,
      categoryId: matchedCat?._id || matchedCat?.id || '',
      description: '',
      price: 2500,
      durationMin: 45,
      gender: 'Unisex',
      popular: false,
      isFeatured: false,
      featuredOrder: featuredServicesCount + 1,
      image: '',
      imagePublicId: '',
    })
    setFormErr({})
    setEditModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (svc) => {
    setIsNewService(false)
    const imgUrl = typeof svc.image === 'object' ? svc.image?.url || '' : svc.image || ''
    const imgId = typeof svc.image === 'object' ? svc.image?.publicId || '' : svc.imagePublicId || ''
    setServiceForm({
      id: svc.id,
      name: svc.name,
      category: svc.category,
      categoryId: svc.categoryId || '',
      description: svc.description || '',
      price: svc.price,
      durationMin: svc.durationMin,
      gender: svc.gender || 'Unisex',
      popular: !!svc.popular,
      isFeatured: Boolean(svc.isFeatured),
      featuredOrder: svc.featuredOrder || 1,
      image: imgUrl,
      imagePublicId: imgId,
    })
    setFormErr({})
    setEditModalOpen(true)
  }

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!serviceForm.name.trim()) errs.name = 'Service name required'
    if (Number(serviceForm.price) <= 0) errs.price = 'Price must be positive (PKR)'
    if (Number(serviceForm.durationMin) <= 0) errs.durationMin = 'Duration must be greater than 0'

    setFormErr(errs)
    if (Object.keys(errs).length > 0) return

    const matchedCat = categories.find(
      (c) => (typeof c === 'object' ? c.name : c) === serviceForm.category
    )
    const payload = {
      ...serviceForm,
      isFeatured: Boolean(serviceForm.isFeatured),
      featuredOrder: Number(serviceForm.featuredOrder) || 1,
      categoryId: matchedCat?._id || matchedCat?.id || serviceForm.categoryId,
      image: {
        url: serviceForm.image,
        publicId: serviceForm.imagePublicId,
      },
    }

    if (isNewService) {
      await adminService.addService(payload)
    } else {
      await adminService.updateService(serviceForm.id, payload)
    }

    setEditModalOpen(false)
    await loadData()
  }

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!confirmToggle.service) return
    await adminService.toggleServiceStatus(confirmToggle.service.id)
    setConfirmToggle({ isOpen: false, service: null })
    await loadData()
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-medium text-charcoal">
              Services &amp; Treatment Catalog
            </h2>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/40 px-3 py-1 font-body text-xs font-semibold text-charcoal"
              title="Services selected for public landing page Curated Salon Menu"
            >
              <Star size={13} className="fill-gold text-gold" />
              <span>
                Featured on Homepage: <strong>{featuredServicesCount} services</strong>
              </span>
            </span>
          </div>
          <p className="font-body text-xs text-mutedBrown mt-1">
            Configure unisex salon menu, pricing in PKR, session duration, and homepage featured treatments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal/10 pb-4">
        {['All', ...categoryNames].map((c) => {
          const isActive = activeCategory === c
          return (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`inline-flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 font-body text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-charcoal text-ivory shadow-sm'
                  : 'bg-white text-charcoal border border-charcoal/15 hover:border-gold hover:text-gold-deep'
              }`}
            >
              {c !== 'All' && <CategoryIcon category={c} size={12} className={isActive ? 'text-gold' : 'text-taupe'} />}
              <span>{c}</span>
            </button>
          )
        })}
      </div>

      {/* Search & Gender filter toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-2.5 text-mutedBrown pointer-events-none" />
          <input
            type="text"
            placeholder="Search service name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 pl-9 pr-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-mutedBrown">Audience:</span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="rounded-sm border border-charcoal/20 bg-ivory/40 py-1.5 px-3 font-body text-xs text-charcoal outline-none focus:border-gold"
          >
            <option value="All">All Audiences</option>
            <option value="Unisex">Unisex</option>
            <option value="Women">Women Only</option>
            <option value="Men">Men Only</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-xl border border-charcoal/10 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="mt-3 font-body text-xs text-mutedBrown">Loading salon service catalog…</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center">
            <Scissors className="mx-auto text-taupe mb-2" size={32} />
            <h3 className="font-display text-xl font-medium text-charcoal">No services found</h3>
            <p className="mt-1 font-body text-xs text-mutedBrown">Try selecting another category or clearing search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs">
              <thead className="border-b border-charcoal/10 bg-ivory/60 text-mutedBrown uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Treatment Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Audience</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-charcoal text-sm">{s.name}</span>
                        {s.isFeatured && s.status === 'active' && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 uppercase">
                            <Star size={9} className="fill-amber-500 text-amber-500" />
                            <span>Featured #{s.featuredOrder || 1}</span>
                          </span>
                        )}
                        {s.popular && (
                          <span className="rounded bg-gold/20 px-1.5 py-0.2 text-[9px] font-semibold text-gold-deep uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-mutedBrown line-clamp-1 mt-0.5 max-w-md">
                        {s.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      <span className="inline-flex items-center gap-1.5 rounded bg-ivory px-2 py-0.5 text-[11px] border border-charcoal/10">
                        <CategoryIcon category={s.category} size={11} className="text-gold" />
                        <span>{s.category}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          s.gender === 'Women'
                            ? 'bg-rose-50 text-rose-700'
                            : s.gender === 'Men'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {s.gender}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-mutedBrown">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-gold" />
                        {duration(s.durationMin)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-display text-sm font-medium text-charcoal whitespace-nowrap">
                      {money(s.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleServiceFeatured(s)}
                          className={`rounded p-1.5 transition-colors ${
                            s.isFeatured && s.status === 'active'
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : 'text-charcoal/40 hover:bg-charcoal/10 hover:text-charcoal'
                          }`}
                          title={
                            s.isFeatured && s.status === 'active'
                              ? `Featured on homepage as #${s.featuredOrder || 1}. Click to unfeature.`
                              : 'Click to feature on homepage'
                          }
                        >
                          <Star size={14} className={s.isFeatured && s.status === 'active' ? 'fill-amber-500 text-amber-500' : ''} />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="rounded p-1.5 text-charcoal/70 hover:bg-charcoal/10 hover:text-charcoal"
                          title="Edit Service"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmToggle({ isOpen: true, service: s })}
                          className={`rounded p-1.5 ${
                            s.status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={s.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      {editModalOpen && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={isNewService ? 'Add Treatment to Menu' : `Edit ${serviceForm.name}`}
          subtitle="Configure pricing, duration in minutes, and client audience"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Treatment Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Signature Balayage & Toning"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
              {formErr.name && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Category *
                </label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                >
                  {categoryNames.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Audience *
                </label>
                <select
                  value={serviceForm.gender}
                  onChange={(e) => setServiceForm({ ...serviceForm, gender: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                >
                  <option value="Unisex">Unisex (All)</option>
                  <option value="Women">Women Only</option>
                  <option value="Men">Men Only</option>
                </select>
              </div>
            </div>

            {/* Service Cover Image Upload */}
            <div>
              <ImageUpload
                label="Treatment Photo / Cover (Cloudinary / Storage)"
                value={serviceForm.image}
                onChange={(url, publicId) =>
                  setServiceForm({
                    ...serviceForm,
                    image: url,
                    imagePublicId: publicId,
                  })
                }
                folder="services"
                aspect="video"
                helperText="Banner or service demonstration (JPG, PNG, WebP up to 5MB)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
                {formErr.price && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={serviceForm.durationMin}
                  onChange={(e) => setServiceForm({ ...serviceForm, durationMin: Number(e.target.value) })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
                {formErr.durationMin && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.durationMin}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Description &amp; Inclusions
              </label>
              <textarea
                rows={3}
                placeholder="Describe consultation, products applied, and expected finish..."
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="svc-popular"
                checked={serviceForm.popular}
                onChange={(e) => setServiceForm({ ...serviceForm, popular: e.target.checked })}
                className="h-4 w-4 rounded text-gold focus:ring-gold"
              />
              <label htmlFor="svc-popular" className="text-xs font-medium text-charcoal">
                Feature as Popular Treatment on Public Home &amp; Dashboard
              </label>
            </div>

            {/* Homepage Featured Treatment Showcase */}
            <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Star size={18} className="fill-gold text-gold shrink-0" />
                  <div>
                    <label
                      htmlFor="service-featured-toggle"
                      className="text-xs font-bold uppercase tracking-wider text-charcoal cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Featured on Homepage</span>
                    </label>
                    <p className="text-[11px] text-mutedBrown">
                      Showcase this treatment in the Curated Salon Menu on the public landing page.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="service-featured-toggle"
                  checked={serviceForm.isFeatured}
                  onChange={(e) => setServiceForm({ ...serviceForm, isFeatured: e.target.checked })}
                  className="h-5 w-5 rounded text-gold focus:ring-gold cursor-pointer"
                />
              </div>

              {serviceForm.isFeatured && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gold/20">
                  <label className="text-xs font-semibold text-charcoal whitespace-nowrap">
                    Homepage Display Order:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={serviceForm.featuredOrder}
                    onChange={(e) => setServiceForm({ ...serviceForm, featuredOrder: Number(e.target.value) })}
                    className="w-20 rounded border border-charcoal/20 bg-white py-1 px-3 text-xs text-charcoal outline-none focus:border-gold"
                  />
                  <span className="text-[11px] text-mutedBrown">
                    Lower numbers appear first in the public homepage menu.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
              >
                {isNewService ? 'Add Service' : 'Save Changes'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmToggle.isOpen}
        onClose={() => setConfirmToggle({ isOpen: false, service: null })}
        onConfirm={handleToggleStatus}
        title={
          confirmToggle.service?.status === 'active'
            ? `Deactivate ${confirmToggle.service?.name}?`
            : `Reactivate ${confirmToggle.service?.name}?`
        }
        message={
          confirmToggle.service?.status === 'active'
            ? `This service will be hidden from public online booking. Existing appointments for this service remain unaffected.`
            : `This service will be made bookable online immediately.`
        }
        confirmLabel={confirmToggle.service?.status === 'active' ? 'Deactivate' : 'Reactivate'}
        confirmVariant={confirmToggle.service?.status === 'active' ? 'danger' : 'primary'}
      />

    </div>
  )
}

