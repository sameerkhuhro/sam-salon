import { Users, Award, Sparkles, Star } from 'lucide-react'

export default function StatsBar() {
  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Happy Clients',
    },
    {
      icon: Award,
      value: '5+',
      label: 'Years Experience',
    },
    {
      icon: Sparkles,
      value: '20+',
      label: 'Beauty & Grooming Services',
    },
    {
      icon: Star,
      value: '100%',
      label: 'Client Satisfaction',
    },
  ]

  return (
    <section className="bg-charcoal border-y border-gold/20 py-8 lg:py-10 text-white">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-charcoal-light">
          {stats.map((s, index) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className={`flex items-center gap-4 ${
                  index !== 0 ? 'md:pl-8' : ''
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold bg-charcoal-light/40">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-ivory">
                    {s.value}
                  </p>
                  <p className="font-body text-xs text-taupe leading-tight mt-0.5">
                    {s.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

