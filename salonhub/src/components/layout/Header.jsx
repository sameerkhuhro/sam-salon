import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, ArrowRight } from 'lucide-react'
import { site } from '@/config/site'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid || open
          ? 'bg-ivory/95 backdrop-blur-md shadow-[0_2px_12px_rgba(36,33,31,0.06)] border-b border-charcoal/10'
          : 'bg-ivory/80 backdrop-blur-[2px]'
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between">
        {/* Wordmark with HAIR • BEAUTY • GROOMING */}
        <Link
          to="/"
          className="group flex flex-col transition-opacity hover:opacity-90"
          aria-label="SAM SALON — go to homepage"
        >
          <div className="flex items-baseline font-display text-[1.95rem] font-medium tracking-tight text-charcoal">
            <span>SAM SALON</span>
            <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
          </div>
          <span className="font-body text-[8.5px] uppercase tracking-[0.24em] text-mutedBrown -mt-1 font-medium">
            HAIR • BEAUTY • GROOMING
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-9 md:flex" aria-label="Main navigation">
          {site.nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `nav-link font-body text-[13.5px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-charcoal active font-semibold' : 'text-charcoal/80 hover:text-charcoal'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Right utility & Book button */}
        <div className="hidden items-center gap-5 md:flex">
          {/* Quick search button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:text-charcoal hover:bg-charcoal/5"
              aria-label="Search services"
              aria-expanded={searchOpen}
            >
              <Search size={18} />
            </button>

            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-11 z-50 flex w-72 items-center rounded border border-charcoal/15 bg-white p-1.5 shadow-lg"
              >
                <input
                  type="text"
                  placeholder="Search hair, beard, facial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent px-3 py-1.5 text-xs text-charcoal outline-none placeholder:text-mutedBrown/60"
                />
                <button
                  type="submit"
                  className="rounded bg-gold px-3 py-1.5 text-xs font-medium text-charcoal transition-colors hover:bg-gold-hover"
                >
                  Go
                </button>
              </form>
            )}
          </div>

          {/* Thin vertical divider line */}
          <div className="h-5 w-px bg-charcoal/20" aria-hidden="true" />

          {/* Book an appointment button */}
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-2.5 font-body text-[13px] font-medium tracking-[0.04em] text-charcoal transition-all duration-200 hover:bg-gold-hover hover:shadow-sm"
          >
            <span>Book an appointment</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/book"
            className="rounded-sm bg-gold px-3.5 py-2 text-xs font-medium text-charcoal"
          >
            Book
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div
        id="mobile-nav"
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          open ? 'max-h-[28rem] border-b border-charcoal/10 bg-ivory opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-page pb-8 pt-4">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="mb-4 flex items-center rounded border border-charcoal/15 bg-white p-2">
            <Search size={16} className="text-mutedBrown mr-2" />
            <input
              type="text"
              placeholder="Search salon services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-mutedBrown/60"
            />
          </form>

          <nav className="flex flex-col divide-y divide-charcoal/10" aria-label="Mobile navigation">
            {site.nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `py-3 font-display text-xl transition-colors ${
                    isActive ? 'font-semibold text-charcoal italic' : 'text-charcoal/80 hover:text-charcoal'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5">
            <Link
              to="/book"
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-gold py-3 text-center text-xs font-semibold uppercase tracking-wider text-charcoal"
            >
              <span>Book an appointment</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
