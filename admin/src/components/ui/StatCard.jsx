/**
 * Reusable KPI Stat Card Component
 * Displays key metrics with an icon, value, label, and secondary context indicator.
 */

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  className = '',
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gold/40 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-mutedBrown truncate">
            {title}
          </p>
          <p className="mt-2 font-display text-3xl font-medium tracking-tight text-charcoal">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 font-body text-xs text-taupe leading-tight truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-deep">
            <Icon size={22} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 border-t border-charcoal/5 pt-3 font-body text-xs text-mutedBrown">
          <span
            className={`font-semibold ${
              trend.positive ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {trend.value}
          </span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  )
}

