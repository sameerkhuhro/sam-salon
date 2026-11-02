import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { images } from '@/config/images'

export default function ServiceStrip() {
  const [fallbacks, setFallbacks] = useState({})
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Drag-to-scroll state
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollStartRef = useRef(0)
  const hasMovedRef = useRef(false)

  const handleImageError = (id, fallback) => {
    setFallbacks((prev) => ({ ...prev, [id]: fallback }))
  }

  // Check scroll bounds to enable/disable arrow buttons
  const checkScrollBounds = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 6)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkScrollBounds()
    el.addEventListener('scroll', checkScrollBounds, { passive: true })
    window.addEventListener('resize', checkScrollBounds)

    return () => {
      el.removeEventListener('scroll', checkScrollBounds)
      window.removeEventListener('resize', checkScrollBounds)
    }
  }, [checkScrollBounds])

  const scrollByDirection = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 300
    const offset = direction === 'left' ? -cardWidth : cardWidth
    el.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    const el = scrollRef.current
    if (!el) return
    isDraggingRef.current = true
    startXRef.current = e.pageX - el.offsetLeft
    scrollStartRef.current = el.scrollLeft
    hasMovedRef.current = false
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const distance = (x - startXRef.current) * 1.3
    if (Math.abs(x - startXRef.current) > 5) {
      hasMovedRef.current = true
    }
    el.scrollLeft = scrollStartRef.current - distance
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
  }

  const handleCardClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault()
    }
  }

  return (
    <section
      className="w-full bg-charcoal border-y border-gold/20 py-3 sm:py-4 lg:py-5 text-white relative z-20 select-none overflow-hidden"
      aria-label="Popular Service Categories"
    >
      <div className="container-page relative flex items-center gap-2 sm:gap-3">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollByDirection('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="hidden sm:inline-flex shrink-0 h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-charcoal text-white transition-all duration-200 hover:border-gold hover:text-gold hover:bg-charcoal-light disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-white/20 disabled:hover:text-white disabled:hover:bg-charcoal shadow-sm z-10"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Non-wrapping Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex flex-nowrap items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1 cursor-grab active:cursor-grabbing touch-pan-x"
        >
          {images.serviceStrip.map((item) => {
            const currentImg = fallbacks[item.id] || item.image

            return (
              <Link
                key={item.id}
                to={`/services?category=${encodeURIComponent(item.category)}`}
                onClick={handleCardClick}
                className="group shrink-0 w-[240px] sm:w-[270px] lg:w-[285px] flex items-center justify-between gap-3 rounded-lg bg-charcoal-light/60 p-2.5 sm:p-3 border border-charcoal-light/80 hover:border-gold/50 transition-all duration-300 hover:bg-charcoal-card"
                aria-label={`${item.title}: ${item.subtitle}`}
              >
                {/* Left: Thumbnail & Text */}
                <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-md bg-charcoal">
                    <img
                      src={currentImg}
                      alt={item.title}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-premium group-hover:scale-110"
                      onError={() => handleImageError(item.id, item.fallback)}
                    />
                    <div className="absolute inset-0 bg-charcoal/15 group-hover:bg-transparent transition-colors" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display text-sm sm:text-[15px] font-medium leading-tight text-ivory group-hover:text-gold transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="font-body text-[11px] text-taupe leading-tight mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Circular Arrow Indicator */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 group-hover:border-gold group-hover:text-gold transition-colors pointer-events-none">
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollByDirection('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className="hidden sm:inline-flex shrink-0 h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-charcoal text-white transition-all duration-200 hover:border-gold hover:text-gold hover:bg-charcoal-light disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-white/20 disabled:hover:text-white disabled:hover:bg-charcoal shadow-sm z-10"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  )
}
