import Hero from '@/components/sections/Hero'
import ServiceStrip from '@/components/sections/ServiceStrip'
import AboutShowcase from '@/components/sections/AboutShowcase'
import StatsBar from '@/components/sections/StatsBar'
import FeaturedServices from '@/components/sections/FeaturedServices'
import FeaturedTeam from '@/components/sections/FeaturedTeam'
import Testimonials from '@/components/sections/Testimonials'
import HoursContact from '@/components/sections/HoursContact'
import CtaBanner from '@/components/sections/CtaBanner'

export default function Home() {
  return (
    <>
      <Hero />
      <ServiceStrip />
      <AboutShowcase />
      <StatsBar />
      <FeaturedServices />
      <FeaturedTeam />
      <Testimonials />
      <HoursContact />
      <CtaBanner />
    </>
  )
}
