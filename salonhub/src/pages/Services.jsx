import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Sparkles } from 'lucide-react'
import { categories, services as fallbackServices } from '@/data/services'
import { getLiveServices } from '@/lib/api'
import { images } from '@/config/images'
import PageHero from '@/components/ui/PageHero'
import ServiceCard from '@/components/ServiceCard'
import CategoryIcon, { getCategoryIcon } from '@/components/ui/CategoryIcon'

// Option 3 category order as requested
const OPTION3_CATEGORIES = [
  'All',
  'Hair',
  'Colour',
  'Grooming',
  'Skin',
  'Nails',
  'Relax',
]

export default function Services() {
  const [allServices, setAllServices] = useState(fallbackServices)
  const [params, setParams] = useSearchParams()
  const activeCategory = params.get('category') || 'All'
  const initialQuery = params.get('q') || ''
  const [search, setSearch] = useState(initialQuery)
  const [activeGender, setActiveGender] = useState('All')

  useEffect(() => {
    let isMounted = true
    getLiveServices().then((liveServices) => {
      if (isMounted && liveServices && liveServices.length > 0) {
        setAllServices(liveServices)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Filter logic
  let list = allServices

  if (activeCategory !== 'All') {
    list = list.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase())
  }

  if (activeGender !== 'All') {
    list = list.filter((s) => s.gender === activeGender || s.gender === 'Unisex')
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    )
  }

  const handleCategorySelect = (cat, shouldScroll = false) => {
    const nextParams = new URLSearchParams(params)
    if (cat === 'All') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', cat)
    }
    setParams(nextParams)

    if (shouldScroll) {
      setTimeout(() => {
        const el = document.getElementById('treatments-section')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 60)
    }
  }

  return (
    <>
      <PageHero
        title="Unisex Services & Transparent Pricing"
        text="From bespoke women's hair artistry and bridal skincare to gentlemen's precision fades and executive hot towel shaves."
        eyebrow="SAM SALON Khairpur Mir's"
      />

      <section className="section bg-ivory pt-12 sm:pt-16 pb-24">
        <div className="container-page">
          
          {/* ─────────────────────────────────────────────────────────────
              1. CRITICAL: PRESERVED SIX PHOTOGRAPHIC CATEGORY CARDS
              Must remain visually unchanged (dimensions, proportions,
              desktop 6-column layout, photos, dark overlays, serif titles,
              and gold Explore → links).
          ───────────────────────────────────────────────────────────── */}
          <div className="mb-16">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => {
                const isActive = activeCategory.toLowerCase() === cat.toLowerCase()
                const imgUrl = images.categories[cat] || images.cta

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat, true)}
                    className={`group relative aspect-[3/4] overflow-hidden rounded-lg text-left transition-all duration-300 ${
                      isActive ? 'ring-2 ring-gold shadow-lg scale-[1.02]' : 'hover:opacity-95 hover:shadow-md'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${cat} services at SAM SALON`}
                      className="h-full w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-display text-lg font-medium text-ivory">{cat}</p>
                      <p className="font-body text-[10px] text-gold uppercase tracking-wider font-semibold">
                        Explore →
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. OPTION 3: CATEGORY TABS + SERVICE CARDS
              Implemented cleanly below the approved 6 category explorer cards.
          ───────────────────────────────────────────────────────────── */}
          <div id="treatments-section" className="scroll-mt-28">
            
            {/* Section Heading & Supporting Description */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-charcoal/10 pb-6 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-mutedBrown">
                    CURATED SALON MENU
                  </span>
                  <span className="h-px w-8 bg-gold/80" aria-hidden="true" />
                </div>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-normal text-charcoal">
                  Explore Our Treatments
                </h2>
                <p className="mt-2 max-w-2xl font-body text-sm sm:text-base text-mutedBrown leading-relaxed">
                  Tailored unisex hair artistry, dimensional colour rituals, precision grooming, aesthetic skincare and rejuvenating head spa sessions.
                </p>
              </div>

              {/* Reset filter shortcut */}
              {(activeCategory !== 'All' || activeGender !== 'All' || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setParams({})
                    setActiveGender('All')
                    setSearch('')
                  }}
                  className="inline-flex items-center gap-1.5 self-start md:self-auto rounded-sm border border-charcoal/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-gold-deep hover:border-gold hover:text-charcoal transition-colors shadow-2xs"
                >
                  <span>Reset all filters</span>
                </button>
              )}
            </div>

            {/* Category Filter Tabs Bar with Standardized Category Icons */}
            <div className="mb-8 flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                {OPTION3_CATEGORIES.map((c) => {
                  const isActive = activeCategory === c || (c === 'All' && activeCategory === 'All')
                  const label = c === 'All' ? 'All Services' : c

                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleCategorySelect(c)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        isActive
                          ? 'bg-charcoal text-ivory shadow-md ring-1 ring-gold/40'
                          : 'border border-charcoal/15 bg-white/70 text-charcoal hover:border-gold hover:bg-white hover:text-gold-deep'
                      }`}
                    >
                      {c === 'All' ? (
                        <Sparkles size={14} className={isActive ? 'text-gold' : 'text-taupe'} />
                      ) : (
                        <CategoryIcon
                          category={c}
                          size={14}
                          className={isActive ? 'text-gold' : 'text-mutedBrown'}
                        />
                      )}
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Sub-toolbar: Gender Filter & Search Input */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-charcoal/10 bg-ivory/60 p-3 sm:px-4">
                
                {/* Gender Tabs */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-mutedBrown mr-1">
                    Audience:
                  </span>
                  {['All', 'Women', 'Men'].map((g) => {
                    const isSelected = activeGender === g
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setActiveGender(g)}
                        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-charcoal text-ivory font-semibold'
                            : 'bg-white/80 text-charcoal hover:bg-white border border-charcoal/10'
                        }`}
                      >
                        {g === 'All' ? 'All Clients' : g}
                      </button>
                    )
                  })}
                </div>

                {/* Search Box */}
                <div className="relative flex items-center min-w-[240px]">
                  <Search size={14} className="absolute left-3 text-mutedBrown pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by treatment name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-charcoal/20 bg-white py-1.5 pl-9 pr-3 text-xs text-charcoal outline-none placeholder:text-mutedBrown/60 focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>
            </div>

            {/* Results Count & Filter Summary */}
            <div className="mb-6 flex items-center justify-between text-xs text-mutedBrown">
              <p>
                Showing <strong className="text-charcoal font-semibold">{list.length}</strong> active treatment{list.length !== 1 ? 's' : ''}
                {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
                {activeGender !== 'All' ? ` for ${activeGender}` : ''}
              </p>
            </div>

            {/* Service Cards Grid (Option 3) */}
            {list.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <ServiceCard key={s.id || s._id} s={s} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-charcoal/10 bg-white p-16 text-center shadow-xs">
                <Sparkles className="mx-auto text-gold mb-3" size={36} />
                <h3 className="font-display text-2xl font-medium text-charcoal">
                  No treatments match your selection
                </h3>
                <p className="mt-2 text-sm text-mutedBrown max-w-md mx-auto">
                  Try clearing your search query or selecting another category filter to explore our full menu.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setParams({})
                    setActiveGender('All')
                    setSearch('')
                  }}
                  className="mt-6 rounded-sm bg-gold px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
                >
                  Show All Treatments
                </button>
              </div>
            )}

          </div>

        </div>
      </section>
    </>
  )
}
