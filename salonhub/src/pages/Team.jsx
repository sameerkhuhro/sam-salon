import { useEffect, useState } from 'react'
import { team as fallbackTeam } from '@/data/team'
import { getLiveStaff } from '@/lib/api'
import PageHero from '@/components/ui/PageHero'
import StaffCard from '@/components/StaffCard'
import CtaBanner from '@/components/sections/CtaBanner'

export default function Team() {
  const [teamMembers, setTeamMembers] = useState(fallbackTeam)

  useEffect(() => {
    let isMounted = true
    getLiveStaff().then((liveStaff) => {
      if (isMounted && liveStaff && liveStaff.length > 0) {
        setTeamMembers(liveStaff)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <PageHero
        title="Meet Our Master Specialists"
        text="Dedicated unisex hair artists, creative colorists, grooming barbers, and certified aestheticians in Khairpur Mir's."
        eyebrow="The Craft & The People"
      />

      <section className="section bg-ivory">
        <div className="container-page">
          {/* Editorial Philosophy */}
          <div className="mb-14 max-w-2xl">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-mutedBrown">
              Specialists, Not Generalists
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-normal text-charcoal">
              Dedicated mastery across hair, beard, skin &amp; wellness.
            </h2>
            <p className="mt-4 font-body text-base text-mutedBrown leading-relaxed">
              Every specialist at SAM SALON brings years of rigorous training and focused expertise. When you book your appointment, you select your stylist directly so your vision is understood and achieved without compromise.
            </p>
          </div>

          {/* Stylist Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((m) => (
              <StaffCard key={m.id || m._id} m={m} />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
