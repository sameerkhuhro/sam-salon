export default function BrandWordmark({
  variant = 'dark',
  size = 'md',
  subtitle = 'ADMIN PORTAL',
  className = '',
}) {
  const isLight = variant === 'light'

  const titleSizeClass = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size] || 'text-2xl'

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className={`flex items-baseline font-display font-medium tracking-tight ${titleSizeClass} ${isLight ? 'text-ivory' : 'text-charcoal'}`}>
        <span>SAM SALON</span>
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold shrink-0" aria-hidden="true" />
      </div>
      {subtitle && (
        <span className={`font-body uppercase font-semibold text-[9px] tracking-[0.24em] -mt-0.5 ${isLight ? 'text-gold' : 'text-gold-deep'}`}>
          {subtitle}
        </span>
      )}
    </div>
  )
}

