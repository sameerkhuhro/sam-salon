import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Facebook, ArrowUp } from 'lucide-react'
import { site } from '@/config/site'

const socialIcons = { Instagram, Facebook }

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-charcoal text-ivory/80">
      {/* Gold top border line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        
        {/* Brand Column */}
        <div className="lg:col-span-4">
          <Link to="/" className="group flex flex-col" aria-label="SAM SALON — go to homepage">
            <div className="flex items-baseline font-display text-[1.95rem] font-medium tracking-tight text-ivory">
              <span>SAM SALON</span>
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            </div>
            <span className="font-body text-[8.5px] uppercase tracking-[0.24em] text-taupe -mt-1 font-medium">
              HAIR • BEAUTY • GROOMING
            </span>
          </Link>

          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-taupe">
            {site.tagline}
          </p>

          {/* Social Links */}
          <div className="mt-6 flex gap-3">
            {site.social.map((s) => {
              const Icon = socialIcons[s.label] || null
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-light bg-charcoal-light/40 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
                >
                  {Icon ? <Icon size={16} /> : s.label.charAt(0)}
                </a>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2">
          <h3 className="mb-5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Navigation
          </h3>
          <ul className="space-y-3 font-body text-sm">
            {site.nav.map((n) => (
              <li key={n.to}>
                <Link className="text-ivory/75 transition-colors hover:text-gold" to={n.to}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-gold hover:underline" to="/book">
                Book appointment
              </Link>
            </li>
          </ul>
        </div>

        {/* Opening Hours */}
        <div className="lg:col-span-3">
          <h3 className="mb-5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Opening Hours
          </h3>
          <ul className="space-y-3 font-body text-sm">
            {site.hours.map(([day, time]) => (
              <li key={day} className="text-ivory/75">
                <span className="text-ivory font-medium block">{day}</span>
                <span className="text-taupe text-xs">{time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit & Contact */}
        <div className="lg:col-span-3">
          <h3 className="mb-5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Salon Location
          </h3>
          <address className="not-italic space-y-3 font-body text-sm text-ivory/75">
            <p className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
              <span>{site.address}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone size={16} className="shrink-0 text-gold" />
              <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-gold transition-colors">
                {site.phone}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail size={16} className="shrink-0 text-gold" />
              <a href={`mailto:${site.email}`} className="hover:text-gold transition-colors">
                {site.email}
              </a>
            </p>
          </address>

          <button
            onClick={scrollToTop}
            className="mt-6 flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-taupe hover:text-gold transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal-light py-6 text-center text-xs text-taupe">
        <div className="container-page flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="text-taupe/90">
            Designed &amp; Developed by{' '}
            <a
              href="https://www.linkedin.com/in/sameerkhuhro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory font-medium transition-colors hover:text-gold hover:underline underline-offset-4 decoration-gold/50"
            >
              Sameer Khuhro
            </a>
          </p>
         
          <p className="text-taupe/80">Premium Unisex Salon · Khairpur Mir's, Sindh, Pakistan</p>
        </div>
      </div>
    </footer>
  )
}
