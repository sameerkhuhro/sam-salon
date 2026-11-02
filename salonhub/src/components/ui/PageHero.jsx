import { images } from '@/config/images'

export default function PageHero({ title, text, eyebrow, image }) {
  const bgImg = image || images.cta

  return (
    <header
      className="relative overflow-hidden bg-charcoal bg-cover bg-center pb-16 pt-32 sm:pt-36 sm:pb-20 text-ivory"
      style={{
        backgroundImage: `linear-gradient(rgba(36,33,31,0.8), rgba(36,33,31,0.92)), url(${bgImg})`,
      }}
    >
      {/* Gold bottom border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      {/* Decorative subtle ambient lights */}
      <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="container-page hero-in relative z-10">
        {eyebrow && (
          <div className="mb-4 flex items-center gap-3">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              {eyebrow}
            </span>
            <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
          </div>
        )}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-ivory max-w-3xl">
          {title}
        </h1>
        {text && (
          <p className="mt-4 max-w-xl font-body text-base sm:text-lg leading-relaxed text-taupe">
            {text}
          </p>
        )}
      </div>
    </header>
  )
}
