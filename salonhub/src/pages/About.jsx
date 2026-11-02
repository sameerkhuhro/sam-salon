import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, HeartHandshake, Sparkles, Clock } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'
import { images } from '@/config/images'
import CtaBanner from '@/components/sections/CtaBanner'

const values = [
  {
    num: '01',
    title: 'Consultation & Personal Care',
    desc: 'Every session begins with a relaxed conversation. We listen carefully to your routine, hair texture, skin tone, and personal aesthetic to tailor our work specifically to you.',
  },
  {
    num: '02',
    title: 'Hygiene & Premium Formulations',
    desc: 'Medical-grade autoclaved sterilization for tools, single-use sanitary wraps, and verified international hair and skincare products from trusted luxury brands.',
  },
  {
    num: '03',
    title: 'Punctuality & Calm Atmosphere',
    desc: 'We respect your time. Appointments begin on time without chaos or overcrowded waiting areas. Step into an unhurried, serene sanctuary built for self-care.',
  },
]

export default function About() {
  const [aboutImg, setAboutImg] = useState(images.about)

  return (
    <>
      <PageHero
        title="More Than A Salon — A Self-Care Destination"
        text="Founded in Khairpur Mir's with a commitment to bringing world-class unisex salon craft, modern aesthetic techniques, and personal comfort together under one roof."
        eyebrow="Our Story & Philosophy"
      />

      {/* Brand Story Section */}
      <section className="section bg-ivory">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-mutedBrown">
                SAM SALON HERITAGE
              </span>
              <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
            </div>

            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-charcoal">
              Redefining hair, grooming and beauty standards in Khairpur Mir's.
            </h2>

            <p className="mt-6 font-body text-base sm:text-lg leading-relaxed text-mutedBrown">
              SAM SALON was founded on a straightforward vision: a salon visit should never feel rushed, generic, or crowded. It should be a dedicated oasis of personal confidence, craftsmanship, and rejuvenation.
            </p>

            <p className="mt-4 font-body text-base sm:text-lg leading-relaxed text-mutedBrown">
              Whether you are visiting for an intricate bridal balayage, a soothing facial treatment, or a sharp gentleman's fade and beard shape-up, our team approaches every service with artistic eye, precision technique, and undivided attention.
            </p>

            <div className="mt-8">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-ivory transition-colors hover:bg-gold hover:text-charcoal"
              >
                <span>Explore our services</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Salon Photo with Frame */}
          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-charcoal shadow-xl border border-charcoal/10">
              <img
                src={aboutImg}
                alt="SAM SALON interior styling station"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                onError={() => setAboutImg(images.salonInteriorMainFallback)}
              />
            </div>
            {/* Offset Gold Border Frame */}
            <div
              className="pointer-events-none absolute -bottom-5 -right-5 hidden h-40 w-40 rounded-2xl border-2 border-gold/40 lg:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Values & Principles */}
      <section className="section bg-ivory-light border-y border-charcoal/10">
        <div className="container-page">
          <div className="mb-14 max-w-xl">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-mutedBrown">
              OUR STANDARDS
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-normal text-charcoal">
              What sets SAM SALON apart
            </h2>
            <p className="mt-3 font-body text-sm text-mutedBrown">
              Every detail of our salon experience is intentionally crafted for your ease and comfort.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-charcoal/10 bg-ivory p-8 transition-all duration-300 hover:border-gold/60 hover:shadow-editorial"
              >
                <span className="font-display text-sm font-semibold italic text-gold-deep tracking-widest block">
                  {v.num}
                </span>
                <h3 className="mt-4 font-display text-2xl font-medium text-charcoal">
                  {v.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-mutedBrown">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
