import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { images } from '@/config/images'
import { site } from '@/config/site'

export default function Hero() {
  const [femaleImgSrc, setFemaleImgSrc] = useState(images.heroFemale)
  const [maleImgSrc, setMaleImgSrc] = useState(images.heroMale)
  const [salonImgSrc, setSalonImgSrc] = useState(images.salonArchInterior)

  return (
    <section className="relative overflow-hidden bg-ivory pt-24 lg:pt-28">
      {/* Background architectural curves for depth */}
      <div className="pointer-events-none absolute -right-24 top-0 h-[640px] w-[640px] rounded-full bg-gold/5 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-charcoal/5 blur-2xl" aria-hidden="true" />

      <div className="container-page relative z-10 pb-12 lg:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          
          {/* ─── LEFT COLUMN: Editorial Typography & Actions ─── */}
          <div className="hero-in lg:col-span-5 xl:col-span-5">
            {/* Location Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-mutedBrown">
                {site.city}
              </span>
              <span className="h-px w-10 bg-gold/80" aria-hidden="true" />
            </div>

            {/* Oversized Editorial Headline */}
            <h1 className="mt-5 font-display text-[2.65rem] sm:text-[4.2rem] lg:text-[4.5rem] xl:text-[5.2rem] font-normal leading-[1.03] tracking-tight text-charcoal">
              Where Style<br />
              Meets <span className="italic font-serif font-normal text-gold">Confidence.</span>
            </h1>

            {/* Supporting Tagline */}
            <p className="mt-6 max-w-md font-body text-base sm:text-lg leading-relaxed text-mutedBrown">
              {site.tagline}
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-3.5 font-body text-[13px] font-medium tracking-[0.06em] text-charcoal shadow-sm transition-all duration-200 hover:bg-gold-hover hover:shadow-gold"
              >
                <span>Book an appointment</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-sm border border-charcoal/30 bg-transparent px-7 py-3.5 font-body text-[13px] font-medium tracking-[0.06em] text-charcoal transition-all duration-200 hover:border-charcoal hover:bg-charcoal/5"
              >
                Explore services
              </Link>
            </div>

            {/* Trust Indicator with 4 overlapping client avatars */}
            <div className="mt-12 flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {images.avatars.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt="SAM SALON client"
                    className="h-11 w-11 rounded-full border-2 border-ivory object-cover shadow-sm"
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-semibold leading-tight text-charcoal">
                  500+
                </span>
                <span className="font-body text-xs text-mutedBrown">
                  Happy Clients
                </span>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Layered Editorial Composition ─── */}
          <div className="hero-img-in relative lg:col-span-7 xl:col-span-7">
            {/* Main composition container */}
            <div className="relative mx-auto max-w-[620px] lg:max-w-none">
              
              {/* Dark Charcoal Curved Backdrop behind models */}
              <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-charcoal via-charcoal to-[#181615] p-3 sm:p-4 shadow-2xl">
                
                {/* Decorative architectural gold rings in background */}
                <div 
                  className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full border border-gold/25" 
                  aria-hidden="true" 
                />
                <div 
                  className="pointer-events-none absolute -left-16 top-14 h-72 w-72 rounded-full border border-gold/15" 
                  aria-hidden="true" 
                />
                <div 
                  className="pointer-events-none absolute right-4 top-4 h-96 w-96 rounded-full border border-gold/15" 
                  aria-hidden="true" 
                />

                {/* 2 Models Grid: Female model and Male model side-by-side / overlapping */}
                <div className="relative z-10 grid h-full grid-cols-12 gap-2 sm:gap-3">
                  
                  {/* Female Model (brunette wavy hair) */}
                  <div className="col-span-6 relative flex items-end">
                    <div className="relative h-[420px] sm:h-[480px] lg:h-[540px] w-full overflow-hidden rounded-[2rem] bg-charcoal-light">
                      <img
                        src={femaleImgSrc}
                        alt="Woman with beautiful styled hair at SAM SALON"
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-premium hover:scale-105"
                        onError={() => setFemaleImgSrc(images.heroFemaleFallback)}
                      />
                      {/* Soft ambient gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Male Model (groomed beard, fade haircut, black polo) */}
                  <div className="col-span-6 relative flex items-end">
                    <div className="relative h-[420px] sm:h-[480px] lg:h-[540px] w-full overflow-hidden rounded-[2rem] bg-charcoal-light">
                      <img
                        src={maleImgSrc}
                        alt="Man with groomed beard and modern haircut at SAM SALON"
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-premium hover:scale-105"
                        onError={() => setMaleImgSrc(images.heroMaleFallback)}
                      />
                      {/* Soft ambient gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Floating Architectural Circular Inset of Salon Interior with Gold Border */}
                <div className="absolute right-4 top-4 z-20 hidden sm:block md:right-6 md:top-6">
                  <div className="group relative h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-full border-2 border-gold/60 shadow-xl bg-charcoal">
                    <img
                      src={salonImgSrc}
                      alt="SAM SALON interior with illuminated arched mirrors"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={() => setSalonImgSrc(images.salonInteriorMainFallback)}
                    />
                    <div className="absolute inset-0 bg-charcoal/20" />
                  </div>
                </div>

                {/* Floating Script Calligraphy: "Good Hair Brighter Days" */}
                <div 
                  className="pointer-events-none absolute right-24 top-20 z-30 hidden lg:block -rotate-6 select-none"
                  aria-hidden="true"
                >
                  <p className="font-display italic text-2xl xl:text-3xl font-light text-gold tracking-wide drop-shadow-md">
                    Good Hair
                  </p>
                  <p className="font-display italic text-2xl xl:text-3xl font-light text-gold tracking-wide pl-4 -mt-1 drop-shadow-md">
                    Brighter Days
                  </p>
                </div>

                {/* Floating Circular Badge: "FOR MEN & WOMEN ↗" */}
                <div className="absolute right-6 bottom-8 z-30 sm:right-8 sm:bottom-10">
                  <div className="relative flex flex-col items-center justify-center rounded-full bg-ivory/95 px-4 py-3.5 sm:px-5 sm:py-4 shadow-xl border border-gold/50 backdrop-blur-md transition-transform duration-300 hover:scale-105">
                    <span className="font-body text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-charcoal text-center leading-tight">
                      FOR<br />
                      MEN &amp;<br />
                      WOMEN
                    </span>
                    <ArrowUpRight size={14} className="mt-1 text-gold-deep" />
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
