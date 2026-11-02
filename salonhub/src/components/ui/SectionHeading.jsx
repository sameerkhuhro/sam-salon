export default function SectionHeading({
  eyebrow,
  title,
  text,
  light,
  center,
  noMargin,
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''} ${noMargin ? '' : 'mb-12'}`}>
      {eyebrow && (
        <div className={`mb-3 flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
          <span className={`font-body text-[11px] font-semibold uppercase tracking-[0.2em] ${light ? 'text-gold' : 'text-mutedBrown'}`}>
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
        </div>
      )}
      <h2 className={`h-section font-display font-normal ${light ? 'text-ivory' : 'text-charcoal'}`}>
        {title}
      </h2>
      {text && (
        <p className={`mt-4 font-body text-base sm:text-lg leading-relaxed ${light ? 'text-ivory/70' : 'text-mutedBrown'}`}>
          {text}
        </p>
      )}
    </div>
  )
}
