import { images } from '@/config/images'
import { site } from '@/config/site'
import SectionHeading from '@/components/ui/SectionHeading'

export default function WhyUs() {
  return (
    <section className="section bg-cream">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Image panel */}
        <div className="relative">
          <img
            src={images.about}
            alt="Stylist consulting with a client in the salon"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
            onError={(e) => { e.target.parentElement.style.background = '#26231F' }}
          />
          {/* Offset gold frame */}
          <div
            className="pointer-events-none absolute -bottom-4 -right-4 hidden h-32 w-32 border border-gold/40 lg:block"
            aria-hidden="true"
          />
        </div>

        {/* Text panel */}
        <div>
          <SectionHeading
            title="Why clients stay with us"
            text="We combine genuine expertise with a calm, unhurried approach — every time."
          />

          <dl className="space-y-8">
            {site.why.map(([title, desc]) => (
              <div key={title} className="flex gap-4">
                <div className="mt-1.5 h-1 w-5 shrink-0 bg-gold" aria-hidden="true" />
                <div>
                  <dt className="font-display text-xl font-medium">{title}</dt>
                  <dd className="mt-1 text-muted">{desc}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
