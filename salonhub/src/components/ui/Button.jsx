import { Link } from 'react-router-dom'

const styles = {
  gold: [
    'bg-gold text-charcoal font-medium shadow-sm',
    'hover:bg-gold-hover hover:text-charcoal',
    'active:bg-gold-deep active:text-white',
    'border border-gold',
  ].join(' '),
  outline: [
    'border border-charcoal/30 text-charcoal bg-transparent',
    'hover:border-charcoal hover:bg-charcoal/5',
    'active:bg-charcoal/10',
  ].join(' '),
  outlineLight: [
    'border border-ivory/40 text-ivory bg-transparent',
    'hover:border-gold hover:text-gold hover:bg-gold/10',
    'active:bg-gold/20',
  ].join(' '),
  dark: [
    'bg-charcoal text-ivory border border-charcoal',
    'hover:bg-charcoal-dark hover:border-charcoal-dark',
    'active:bg-charcoal-dark',
  ].join(' '),
  ghost: [
    'text-charcoal underline-offset-4 font-medium',
    'hover:text-gold-deep hover:underline',
  ].join(' '),
}

const base =
  'inline-flex items-center justify-center gap-2 px-6 py-3 text-[13px] font-body font-medium tracking-[0.06em] transition-all duration-200 rounded-sm disabled:cursor-not-allowed disabled:opacity-40 select-none'

export default function Button({ to, href, variant = 'gold', className = '', children, ...rest }) {
  const cls = `${base} ${styles[variant] || styles.gold} ${className}`

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button className={cls} {...rest}>{children}</button>
}
