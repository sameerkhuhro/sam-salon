import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Gem, Sparkles } from 'lucide-react'
import { images } from '@/config/images'

export default function AboutShowcase() {
  const [salonImg, setSalonImg] = useState(images.salonInteriorMain)

  return (
    <section className="bg-ivory py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          
          {/* Left Column: Heading & Story */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-mutedBrown">
                ABOUT SAM SALON
              </span>
              <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
            </div>

            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-normal leading-[1.12] text-charcoal">
              More than a salon,<br />
              it's a <span className="italic font-serif font-normal text-gold-deep">self-care destination.</span>
            </h2>

            <p className="mt-5 font-body text-sm sm:text-base leading-relaxed text-mutedBrown">
              At SAM SALON, we believe everyone deserves to look and feel their best. Our professional stylists and beauty experts bring creativity, precision and care to every service, in a warm and relaxing environment.
            </p>

            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 font-body text-[13px] font-medium tracking-[0.06em] text-charcoal transition-all duration-200 hover:bg-gold-hover hover:shadow-sm"
              >
                <span>Our story</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Center Column: High-End Salon Interior Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl bg-charcoal shadow-xl border border-charcoal/10">
              <img
                src={salonImg}
                alt="SAM SALON modern salon interior with arched vanity stations"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                onError={() => setSalonImg(images.salonInteriorMainFallback)}
              />
              {/* Subtle SAM SALON Branding Overlay simulating wall sign */}
              <div className="absolute right-4 top-4 rounded bg-charcoal/70 px-3 py-1.5 backdrop-blur-md border border-white/10 hidden sm:block">
                <p className="font-display text-xs text-ivory tracking-wide">SAM SALON.</p>
                <p className="text-[7.5px] uppercase tracking-[0.2em] text-gold -mt-0.5 font-medium">Beauty Lives Here</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Editorial Feature Pillars */}
          <div className="lg:col-span-3 flex flex-col justify-center space-y-6">
            
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/20 bg-ivory-light text-charcoal shadow-sm">
                <Users size={18} className="text-charcoal" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-charcoal">
                  Expert Stylists
                </h3>
                <p className="mt-0.5 font-body text-xs text-mutedBrown leading-relaxed">
                  Trained professionals with real experience.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/20 bg-ivory-light text-charcoal shadow-sm">
                <Gem size={18} className="text-charcoal" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-charcoal">
                  Premium Products
                </h3>
                <p className="mt-0.5 font-body text-xs text-mutedBrown leading-relaxed">
                  High-quality, trusted brands.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/20 bg-ivory-light text-charcoal shadow-sm">
                <Sparkles size={18} className="text-charcoal" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-charcoal">
                  Relaxing Atmosphere
                </h3>
                <p className="mt-0.5 font-body text-xs text-mutedBrown leading-relaxed">
                  A calm and comfortable space.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}

