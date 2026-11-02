import { Clock, MapPin, Phone, Mail, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '@/config/site'

export default function HoursContact() {
  return (
    <section className="section bg-ivory">
      <div className="container-page">
        <div className="rounded-2xl border border-charcoal/10 bg-ivory-light p-8 sm:p-12 lg:p-16 shadow-sm">
          <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
            
            {/* Opening hours */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-mutedBrown">
                    Availability
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-charcoal">
                    Opening hours
                  </h2>
                </div>
              </div>

              <ul className="divide-y divide-charcoal/10">
                {site.hours.map(([day, time]) => (
                  <li key={day} className="flex items-center justify-between py-4">
                    <span className="font-body text-sm font-medium text-charcoal">{day}</span>
                    <span className="font-body text-sm text-mutedBrown">{time}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-4">
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal transition-all hover:bg-gold-hover"
                >
                  <span>Check time slots</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Find us in Khairpur Mir's */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-mutedBrown">
                    Location
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-charcoal">
                    Visit our salon
                  </h2>
                </div>
              </div>

              <address className="not-italic space-y-4 font-body text-sm text-mutedBrown">
                <p className="text-charcoal font-medium text-base">
                  {site.address}
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone size={16} className="text-gold shrink-0" />
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-gold-deep transition-colors">
                    {site.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail size={16} className="text-gold shrink-0" />
                  <a href={`mailto:${site.email}`} className="hover:text-gold-deep transition-colors">
                    {site.email}
                  </a>
                </p>
              </address>

              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={site.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-gold-deep hover:underline"
                >
                  <span>Get directions on Google Maps</span>
                  <ArrowRight size={13} />
                </a>
              </div>

              <div className="mt-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-sm border border-charcoal/30 bg-transparent px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal/5"
                >
                  <span>Contact us directly</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
