/**
 * SalonHub Admin Layout Shell
 * Houses the responsive sidebar, sticky top header, and page content outlet.
 */

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-ivory text-charcoal font-body antialiased">
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[96rem] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

