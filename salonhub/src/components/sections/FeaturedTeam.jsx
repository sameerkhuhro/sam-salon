import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { team as fallbackTeam } from '@/data/team'
import { getFeaturedStaff } from '@/lib/api'
import StaffCard from '@/components/StaffCard'
import SectionHeading from '@/components/ui/SectionHeading'

export default function FeaturedTeam() {
  const [featuredStaff, setFeaturedStaff] = useState(() => fallbackTeam.slice(0, 4))

  useEffect(() => {
    let isMounted = true
    getFeaturedStaff().then((liveStaff) => {
      if (isMounted && liveStaff && liveStaff.length > 0) {
        setFeaturedStaff(liveStaff.slice(0, 4))
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="section bg-ivory">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Specialist Master Artists"
            title="Meet your stylists & barbers"
            text="Experienced unisex specialists dedicated to craft, precision, and personal care."
            noMargin
          />
          <Link
            to="/team"
            className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.14em] text-charcoal hover:text-gold transition-colors self-start md:self-auto"
          >
            <span>See the full team</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredStaff.map((m) => (
            <StaffCard key={m.id || m._id} m={m} />
          ))}
        </div>
      </div>
    </section>
  )
}
