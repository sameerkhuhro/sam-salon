export default function BrandWordmark({
  variant = 'dark',
  size = 'md',
  showTagline = true,
  className = '',
}) {
  const isLight = variant === 'light'

  const titleSizeClass = {
    sm: 'text-xl',
    md: 'text-[1.85rem] sm:text-[1.95rem]',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  }[size] || 'text-[1.95rem]'

  const taglineSizeClass = {
    sm: 'text-[7.5px] tracking-[0.2em]',
    md: 'text-[8.5px] tracking-[0.26em]',
    lg: 'text-[10px] tracking-[0.28em]',
    xl: 'text-xs tracking-[0.3em]',
  }[size] || 'text-[8.5px] tracking-[0.26em]'

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className={`flex items-baseline font-display font-medium tracking-tight ${titleSizeClass} ${isLight ? 'text-ivory' : 'text-charcoal'}`}>
        <span>SAM SALON</span>
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold shrink-0" aria-hidden="true" />
      </div>
      {showTagline && (
        <span className={`font-body uppercase font-medium -mt-1 ${taglineSizeClass} ${isLight ? 'text-taupe' : 'text-mutedBrown'}`}>
          HAIR • BEAUTY • GROOMING
        </span>
      )}
    </div>
  )
}

