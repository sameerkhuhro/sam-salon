import { Star, Quote } from 'lucide-react'
import { testimonials } from '@/data/team'
import SectionHeading from '@/components/ui/SectionHeading'

export default function Testimonials() {
  return (
    <section className="section bg-charcoal text-ivory relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-gold/5 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-gold/5 blur-3xl" aria-hidden="true" />

      <div className="container-page relative z-10">
        <SectionHeading
          light
          center
          eyebrow="Client Experiences"
          title="What our clients say"
          text="Sample reviews and genuine impressions from men and women who trust SAM SALON."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <figure
              key={idx}
              className="relative flex flex-col justify-between rounded-xl border border-charcoal-light bg-charcoal-light/30 p-8 backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:bg-charcoal-card"
            >
              <div>
                {/* 5-star rating */}
                <div className="flex items-center gap-1 text-gold mb-6">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>

                <Quote size={28} className="text-gold/25 mb-3" />

                <blockquote className="font-display text-xl font-normal italic leading-relaxed text-ivory/95">
                  "{t.text}"
                </blockquote>
              </div>

              <figcaption className="mt-8 flex items-center justify-between border-t border-charcoal-light pt-5">
                <div>
                  <p className="font-display text-lg font-medium text-ivory">{t.name}</p>
                  <p className="font-body text-xs text-taupe">{t.service || 'Salon Client'}</p>
                </div>
                <span className="rounded bg-gold/15 px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-gold">
                  Verified
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
