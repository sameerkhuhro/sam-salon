import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Services from '@/pages/Services'
import Team from '@/pages/Team'
import Book from '@/pages/Book'
import Confirmation from '@/pages/Confirmation'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public Website Routes */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="team" element={<Team />} />
        <Route path="book" element={<Book />} />
        <Route path="booking/confirmation/:ref" element={<Confirmation />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
